import { useEffect, useState } from "react"

// const BASE_URL = "https://web-production-11c4.up.railway.app/api"
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

const makeRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    })
    return response
  } catch (error) {
    console.error(`Request to ${endpoint} failed:`, error)
    return null
  }
}

const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      let response = await makeRequest("auth-check/")

      if (response?.status === 401) {
        const refreshResponse = await makeRequest("token/refresh/", "POST")

        if (refreshResponse?.ok) {
          response = await makeRequest("auth-check/")
        }
      }

      setIsAuthenticated(response?.ok || false)
    }

    checkAuth()
  }, [])

  return isAuthenticated
}

export default useAuthCheck
