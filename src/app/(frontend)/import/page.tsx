'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function ImportXLSXPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingTaxonomies, setAddingTaxonomies] = useState(false)
  const [taxonomyResult, setTaxonomyResult] = useState<any>(null)
  const [deleteAll, setDeleteAll] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (
      selectedFile &&
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid XLSX file')
      setFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('deleteAll', deleteAll ? 'true' : 'false')

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleAddTaxonomies = async () => {
    setAddingTaxonomies(true)
    setError(null)
    setTaxonomyResult(null)

    try {
      const response = await fetch('/api/import/add-taxonomies', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add taxonomies')
      }

      setTaxonomyResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAddingTaxonomies(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Import XLSX File</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Select XLSX File
            </label>
            <input
              type="file"
              id="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="deleteAll"
              checked={deleteAll}
              onChange={(e) => setDeleteAll(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="deleteAll" className="ml-2 block text-sm text-gray-700">
              Verwijder alle bestaande lesmaterialen voordat import
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Import File'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Predefined Taxonomies</h2>
        <p className="text-gray-600 mb-4">
          This will add all the predefined EDL taxonomies including school types, competences,
          topics, material types, languages, and CEFR levels.
        </p>
        <button
          onClick={handleAddTaxonomies}
          disabled={addingTaxonomies}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {addingTaxonomies ? 'Adding Taxonomies...' : 'Add EDL Taxonomies'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800 font-medium mb-2">Import Results</div>
          <div className="text-green-600 mb-4">
            <div>Total rows: {result.summary.total}</div>
            <div>Successful: {result.summary.success}</div>
            <div>Errors: {result.summary.errors}</div>
          </div>

          {result.results && result.results.length > 0 && (
            <div className="mt-4">
              <h3 className="text-green-800 font-medium mb-2">Details:</h3>
              <div className="max-h-96 overflow-y-auto">
                {result.results.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded mb-1 ${item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    Row {item.row}:{' '}
                    {item.success ? `✅ ${item.title}` : `❌ ${item.title} - ${item.error}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {taxonomyResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-blue-800 font-medium mb-2">Taxonomy Addition Results</div>
          <div className="text-blue-600 mb-4">
            <div>Total created: {taxonomyResult.summary.totalCreated}</div>
            <div>Total updated: {taxonomyResult.summary.totalUpdated}</div>
            <div>Total skipped: {taxonomyResult.summary.totalSkipped}</div>
            <div>Total processed: {taxonomyResult.summary.totalProcessed}</div>
          </div>

          {taxonomyResult.results && Object.keys(taxonomyResult.results).length > 0 && (
            <div className="mt-4">
              <h3 className="text-blue-800 font-medium mb-2">Details by Collection:</h3>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {Object.entries(taxonomyResult.results).map(
                  ([collection, items]: [string, any]) => (
                    <div key={collection} className="border-t border-blue-200 pt-2">
                      <h4 className="text-blue-700 font-medium mb-2 capitalize">
                        {collection.replace('-', ' ')}
                      </h4>
                      <div className="space-y-1">
                        {items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className={`text-sm p-1 rounded ${
                              item.status === 'created'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'updated'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : item.status === 'skipped'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status === 'created'
                              ? '✅'
                              : item.status === 'updated'
                                ? '🔄'
                                : item.status === 'skipped'
                                  ? '⏭️'
                                  : '❌'}{' '}
                            {item.title}
                            {item.error && ` - ${item.error}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
