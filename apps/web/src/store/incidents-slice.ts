import { createSlice } from "@reduxjs/toolkit"

import type { RootState } from "@/store/store"

export type EtlStatus = "open" | "approved" | "rejected" | "resolved"
export type NorthstarStatus = "open" | "acknowledged" | "rejected"

type IncidentsState = {
  northstar: {
    status: NorthstarStatus
    humanDecision: string
    slaDeadline: number
    slaResolvedAt: number | null
  }
  etl: {
    status: EtlStatus
    humanDecision: string
    slaDeadline: number
    slaResolvedAt: number | null
  }
}

const loadedAt = Date.now()

const initialState: IncidentsState = {
  northstar: {
    status: "open",
    humanDecision: "Pending",
    slaDeadline: loadedAt + 18 * 60 * 1000,
    slaResolvedAt: null,
  },
  etl: {
    status: "open",
    humanDecision: "Pending",
    slaDeadline: loadedAt - 24 * 60 * 1000,
    slaResolvedAt: null,
  },
}

const incidentsSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    acknowledgeNorthstar: (state) => {
      state.northstar.status = "acknowledged"
      state.northstar.humanDecision = "Approved"
      state.northstar.slaResolvedAt = Date.now()
    },
    rejectNorthstar: (state) => {
      state.northstar.status = "rejected"
      state.northstar.humanDecision = "Rejected"
      state.northstar.slaResolvedAt = Date.now()
    },
    approveEtl: (state) => {
      state.etl.status = "resolved"
      state.etl.humanDecision = "Approved"
      state.etl.slaResolvedAt = Date.now()
    },
    rejectEtl: (state) => {
      state.etl.status = "rejected"
      state.etl.humanDecision = "Rejected"
      state.etl.slaResolvedAt = Date.now()
    },
  },
})

export const { acknowledgeNorthstar, rejectNorthstar, approveEtl, rejectEtl } =
  incidentsSlice.actions
export const selectNorthstarState = (state: RootState) =>
  state.incidents.northstar
export const selectEtlState = (state: RootState) => state.incidents.etl
export const incidentsReducer = incidentsSlice.reducer
