const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: Record<string, unknown> | URLSearchParams
  headers?: Record<string, string>
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options

  // Read token from localStorage (only available in browser)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Build headers
  const requestHeaders: Record<string, string> = {
    ...headers,
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  // Handle body — URLSearchParams (for login) vs JSON
  let requestBody: string | URLSearchParams | undefined
  if (body instanceof URLSearchParams) {
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded"
    requestBody = body
  } else if (body) {
    requestHeaders["Content-Type"] = "application/json"
    requestBody = JSON.stringify(body)
  }

  // Make the call
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
  })

  // Handle errors
  if (!response.ok) {
    // If unauthorized, clear token and redirect
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    // Try to extract error message from response
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorMessage
    } catch {
      // Response wasn't JSON, use default message
    }

    throw new Error(errorMessage)
  }

  // Handle 204 No Content (DELETE responses)
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}