import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { ActivityFeedEntry } from "@/store/command-center-slice"
import type { RootState } from "@/store/store"

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

export type AuditLogQuery = {
  limit?: number
  offset?: number
  action?: string
  agent?: string
  supplier?: string
  mode?: string
  env?: string
}

export type AuditFilters = {
  action: string
  agent: string
  supplier: string
  mode: string
  env: string
}

type AuditState = {
  entries: ActivityFeedEntry[]
  total: number
  status: AsyncStatus
  error: string | null
  filters: AuditFilters
  page: number
  pageSize: number
}

const initialFilters: AuditFilters = {
  action: "all",
  agent: "all",
  supplier: "",
  mode: "all",
  env: "all",
}

const initialState: AuditState = {
  entries: [],
  total: 0,
  status: "idle",
  error: null,
  filters: initialFilters,
  page: 1,
  pageSize: 10,
}

export const fetchAuditLog = createAsyncThunk(
  "audit/fetchAuditLog",
  async (query: AuditLogQuery = {}) => {
    const response = await axiosInstance.get<{ total: number; entries: ActivityFeedEntry[] }>(
      "/api/audit-log",
      { params: query }
    )
    return response.data
  }
)

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    setAuditFilter: (
      state,
      action: PayloadAction<{ key: keyof AuditFilters; value: string }>
    ) => {
      state.filters[action.payload.key] = action.payload.value
      state.page = 1
    },
    setAuditPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLog.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.entries = action.payload.entries
        state.total = action.payload.total
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load the audit log"
      })
  },
})

export const { setAuditFilter, setAuditPage } = auditSlice.actions
export const selectAuditEntries = (state: RootState) => state.audit.entries
export const selectAuditTotal = (state: RootState) => state.audit.total
export const selectAuditStatus = (state: RootState) => state.audit.status
export const selectAuditError = (state: RootState) => state.audit.error
export const selectAuditFilters = (state: RootState) => state.audit.filters
export const selectAuditPage = (state: RootState) => ({
  page: state.audit.page,
  pageSize: state.audit.pageSize,
})
export function auditQueryFrom(state: RootState): AuditLogQuery {
  const { filters, page, pageSize } = state.audit
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    action: filters.action !== "all" ? filters.action : undefined,
    agent: filters.agent !== "all" ? filters.agent : undefined,
    supplier: filters.supplier || undefined,
    mode: filters.mode !== "all" ? filters.mode : undefined,
    env: filters.env !== "all" ? filters.env : undefined,
  }
}
export const auditReducer = auditSlice.reducer
