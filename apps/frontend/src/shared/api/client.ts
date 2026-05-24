import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1"

/**
 * Shared Axios instance for all API calls.
 * Interceptors handle global error logging.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API]", error.response?.data ?? error.message)
    return Promise.reject(error)
  }
)
