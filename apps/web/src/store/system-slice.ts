import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type AppSettings = {
  governanceDefaults: Record<string, string>
  connectedSystems: string[]
  notificationPreferences: Record<string, boolean>
  environment: string
  dataRetention: { logsMonths: number; auditRetention: string }
}

export type HealthCheck = { status: string }
export type SystemStatus = { status: string; checks: Record<string, string> }

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type SystemState = {
  settings: AppSettings | null
  settingsStatus: AsyncStatus
  settingsError: string | null
  environmentStatus: AsyncStatus
  health: HealthCheck | null
  healthStatus: AsyncStatus
  status: SystemStatus | null
  statusStatus: AsyncStatus
}

const initialState: SystemState = {
  settings: null,
  settingsStatus: "idle",
  settingsError: null,
  environmentStatus: "idle",
  health: null,
  healthStatus: "idle",
  status: null,
  statusStatus: "idle",
}

export const fetchSettings = createAsyncThunk("system/fetchSettings", async () => {
  const response = await axiosInstance.get<AppSettings>("/api/settings")
  return response.data
})

export const fetchHealth = createAsyncThunk("system/fetchHealth", async () => {
  const response = await axiosInstance.get<HealthCheck>("/health")
  return response.data
})

export const fetchSystemStatus = createAsyncThunk("system/fetchSystemStatus", async () => {
  const response = await axiosInstance.get<SystemStatus>("/api/system/status")
  return response.data
})

export const switchEnvironment = createAsyncThunk(
  "system/switchEnvironment",
  async (environment: string) => {
    const response = await axiosInstance.post<{ environment: string }>(
      "/api/system/environment",
      { environment }
    )
    return response.data.environment
  }
)

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.settingsStatus = "loading"
        state.settingsError = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settingsStatus = "succeeded"
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settingsStatus = "failed"
        state.settingsError = action.error.message ?? "Failed to load settings"
      })
      .addCase(switchEnvironment.pending, (state) => {
        state.environmentStatus = "loading"
      })
      .addCase(switchEnvironment.fulfilled, (state, action) => {
        state.environmentStatus = "succeeded"
        if (state.settings) state.settings.environment = action.payload
      })
      .addCase(switchEnvironment.rejected, (state) => {
        state.environmentStatus = "failed"
      })
      .addCase(fetchHealth.pending, (state) => {
        state.healthStatus = "loading"
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.healthStatus = "succeeded"
        state.health = action.payload
      })
      .addCase(fetchHealth.rejected, (state) => {
        state.healthStatus = "failed"
      })
      .addCase(fetchSystemStatus.pending, (state) => {
        state.statusStatus = "loading"
      })
      .addCase(fetchSystemStatus.fulfilled, (state, action) => {
        state.statusStatus = "succeeded"
        state.status = action.payload
      })
      .addCase(fetchSystemStatus.rejected, (state) => {
        state.statusStatus = "failed"
      })
  },
})

export const selectSettings = (state: RootState) => state.system.settings
export const selectSettingsStatus = (state: RootState) => state.system.settingsStatus
export const selectSettingsError = (state: RootState) => state.system.settingsError
export const selectEnvironmentStatus = (state: RootState) => state.system.environmentStatus
export const selectHealth = (state: RootState) => ({
  data: state.system.health,
  status: state.system.healthStatus,
})
export const selectSystemStatus = (state: RootState) => ({
  data: state.system.status,
  status: state.system.statusStatus,
})
export const systemReducer = systemSlice.reducer
