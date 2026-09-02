import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Separate standalone service (qa_agent backend) -- GitHub/QA analysis, not
// the smart_etl / reliability_pipeline app behind axiosInstance above.
export const qaAgentAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_QA_AGENT_API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
})
