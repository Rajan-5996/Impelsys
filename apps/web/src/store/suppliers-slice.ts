import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type SupplierTier = "Preferred" | "Approved" | "Monitor" | "At Risk"

export type Supplier = {
  id: string
  name: string
  region: string
  deliveryMethod: string
  sla: string
  volumeBaseline: number
  score: number
  tier: SupplierTier
  healthStatus: string
  isReal: boolean
  feed: string
  pipeline: string
  owner: string
  frequency: string
  expectedTime: string
  format: string
  fileSize: string
  liveFeedStats: {
    recordCount: number
    nullCustomerIdCount: number
    lastLandedAt: string
  } | null
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

export type SupplierSortKey = "name" | "feed" | "region" | "score" | "tier"

type SuppliersState = {
  search: string
  region: string
  method: string
  tier: string
  sortKey: SupplierSortKey | null
  sortDir: 1 | -1
  page: number
  pageSize: number
  list: Supplier[]
  listStatus: AsyncStatus
  listError: string | null
  current: Supplier | null
  currentStatus: AsyncStatus
  currentError: string | null
  filterOptions: { regions: string[]; deliveryMethods: string[] }
  filterOptionsStatus: AsyncStatus
}

const initialState: SuppliersState = {
  search: "",
  region: "all",
  method: "all",
  tier: "all",
  sortKey: null,
  sortDir: 1,
  page: 1,
  pageSize: 8,
  list: [],
  listStatus: "idle",
  listError: null,
  current: null,
  currentStatus: "idle",
  currentError: null,
  filterOptions: { regions: [], deliveryMethods: [] },
  filterOptionsStatus: "idle",
}

export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async () => {
    const response = await axiosInstance.get<{ suppliers: Supplier[] }>(
      "/suppliers"
    )
    return response.data.suppliers
  }
)

export const fetchSupplierById = createAsyncThunk(
  "suppliers/fetchSupplierById",
  async (supplierId: string) => {
    const response = await axiosInstance.get<Supplier>(
      `/suppliers/${supplierId}`
    )
    return response.data
  }
)

export const fetchSuppliersCsv = createAsyncThunk(
  "suppliers/fetchSuppliersCsv",
  async () => {
    const response = await axiosInstance.get<string>("/suppliers/export/csv", {
      responseType: "text",
    })
    return response.data
  }
)

export const fetchSupplierFilterOptions = createAsyncThunk(
  "suppliers/fetchSupplierFilterOptions",
  async () => {
    const response = await axiosInstance.get<{
      regions: string[]
      deliveryMethods: string[]
    }>("/suppliers/filter-options")
    return response.data
  }
)

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.listStatus = "loading"
        state.listError = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.listStatus = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.listStatus = "failed"
        state.listError = action.error.message ?? "Failed to load suppliers"
      })
      .addCase(fetchSupplierById.pending, (state) => {
        state.currentStatus = "loading"
        state.currentError = null
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded"
        state.current = action.payload
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.currentStatus = "failed"
        state.currentError = action.error.message ?? "Failed to load supplier"
      })
      .addCase(fetchSupplierFilterOptions.pending, (state) => {
        state.filterOptionsStatus = "loading"
      })
      .addCase(fetchSupplierFilterOptions.fulfilled, (state, action) => {
        state.filterOptionsStatus = "succeeded"
        state.filterOptions = action.payload
      })
      .addCase(fetchSupplierFilterOptions.rejected, (state) => {
        state.filterOptionsStatus = "failed"
      })
  },
  reducers: {
    setSupplierSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.page = 1
    },
    setSupplierFilter: (
      state,
      action: PayloadAction<{
        key: "region" | "method" | "tier"
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
    resetSupplierFilters: (state) => {
      Object.assign(state, {
        ...initialState,
        list: state.list,
        listStatus: state.listStatus,
        listError: state.listError,
        current: state.current,
        currentStatus: state.currentStatus,
        currentError: state.currentError,
        filterOptions: state.filterOptions,
        filterOptionsStatus: state.filterOptionsStatus,
      })
    },
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
export const selectSuppliersList = (state: RootState) => state.suppliers.list
export const selectSuppliersListStatus = (state: RootState) =>
  state.suppliers.listStatus
export const selectSuppliersListError = (state: RootState) =>
  state.suppliers.listError
export const selectCurrentSupplier = (state: RootState) => ({
  data: state.suppliers.current,
  status: state.suppliers.currentStatus,
  error: state.suppliers.currentError,
})
export const selectSupplierFilterOptions = (state: RootState) =>
  state.suppliers.filterOptions
export const suppliersReducer = suppliersSlice.reducer
