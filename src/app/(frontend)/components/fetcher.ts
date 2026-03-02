export function fetcher<T = unknown>(url: string): Promise<T> {
  return fetch(url).then((r) => {
    if (r.ok) return r.json()

    return r.json().then((data) => {
      throw new Error(data.message || 'Failed to fetch')
    })
  })
}
