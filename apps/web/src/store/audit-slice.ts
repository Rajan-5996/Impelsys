import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { AUDIT_LOG_SEED, type AuditLogEntry } from "@/data/audit"
import type { RootState } from "@/store/store"

type AuditFilters = {
  search: string
  agent: string
  action: string
  supplier: string
  decision: string
  mode: string
}

type AuditState = {
  log: AuditLogEntry[]
  filters: AuditFilters
  page: number
  pageSize: number
}

const initialFilters: AuditFilters = {
  search: "",
  agent: "all",
  action: "all",
  supplier: "all",
  decision: "all",
  mode: "all",
}

const initialState: AuditState = {
  log: AUDIT_LOG_SEED,
  filters: initialFilters,
  page: 1,
  pageSize: 8,
}

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    addAuditEntry: (state, action: PayloadAction<AuditLogEntry>) => {
      state.log.unshift(action.payload)
    },
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
})

export const { addAuditEntry, setAuditFilter, setAuditPage } =
  auditSlice.actions
export const selectAuditLog = (state: RootState) => state.audit.log
export const selectAuditFilters = (state: RootState) => state.audit.filters
export const selectAuditPage = (state: RootState) => state.audit.page
export const auditReducer = auditSlice.reducer
