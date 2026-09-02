import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { RootState } from "@/store/store"

export type SupplierSortKey =
  | "name"
  | "feed"
  | "criticality"
  | "avgVolume"
  | "actual"
  | "deviation"
  | "score"

type SuppliersState = {
  search: string
  region: string
  method: string
  status: string
  slaState: string
  criticality: string
  sortKey: SupplierSortKey | null
  sortDir: 1 | -1
  page: number
  pageSize: number
}

const initialState: SuppliersState = {
  search: "",
  region: "all",
  method: "all",
  status: "all",
  slaState: "all",
  criticality: "all",
  sortKey: null,
  sortDir: 1,
  page: 1,
  pageSize: 8,
}

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    setSupplierSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.page = 1
    },
    setSupplierFilter: (
      state,
      action: PayloadAction<{
        key: "region" | "method" | "status" | "slaState" | "criticality"
        value: string
      }>
    ) => {
      state[action.payload.key] = action.payload.value
      state.page = 1
    },
    setSupplierSort: (state, action: PayloadAction<SupplierSortKey>) => {
      if (state.sortKey === action.payload) {
        state.sortDir = state.sortDir === 1 ? -1 : 1
      } else {
        state.sortKey = action.payload
        state.sortDir = 1
      }
    },
    setSupplierPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    resetSupplierFilters: () => initialState,
  },
})

export const {
  setSupplierSearch,
  setSupplierFilter,
  setSupplierSort,
  setSupplierPage,
  resetSupplierFilters,
} = suppliersSlice.actions

export const selectSupplierFilters = (state: RootState) => state.suppliers
export const suppliersReducer = suppliersSlice.reducer
