/**
 * Helper function to check if a string looks like a PDF
 * @param url - The URL or file path to check
 * @returns true if the string appears to be a PDF, false otherwise
 */
export function considerPDF(url: string | null | undefined): boolean {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  // Check if URL ends with .pdf (with or without query parameters)
  return (
    lowerUrl.endsWith('.pdf') ||
    lowerUrl.includes('.pdf?') ||
    lowerUrl.includes('.pdf/') ||
    lowerUrl.includes('.pdf#')
  )
}
