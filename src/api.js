const API_PREFIX = '/api'

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { error: 'Invalid response' }
  }
}

export async function apiFetch(path, options = {}) {
  const { json, ...init } = options
  const headers = new Headers(init.headers)
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(json)
  }
  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed')
    err.status = res.status
    err.details = data?.details
    err.body = data
    throw err
  }
  return data
}
