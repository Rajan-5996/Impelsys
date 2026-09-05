import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type Vendor = {
  vendor_id: string
  name: string
  run_id: string | null
  status: string
  current_stage: string | null
  ai_summary: string
  updated_at: string | null
}

type TriggerVendorResponse = {
  vendor_id: string
  name: string
  action: string
  run_id?: string
  status?: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type VendorsState = {
  list: Vendor[]
  status: AsyncStatus
  error: string | null
  triggeringId: string | null
}

const initialState: VendorsState = {
  list: [],
  status: "idle",
  error: null,
  triggeringId: null,
}

export const fetchVendors = createAsyncThunk("vendors/fetchVendors", async () => {
  const response = await axiosInstance.get<Vendor[]>("/smart-etl/vendors")
  return response.data
})

export const triggerVendor = createAsyncThunk(
  "vendors/triggerVendor",
  async (vendorId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<TriggerVendorResponse>(
        `/smart-etl/vendors/${vendorId}/trigger`
      )
      dispatch(fetchVendors())
      return response.data
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      return rejectWithValue(typeof detail === "string" ? detail : "Failed to trigger this vendor's pipeline.")
    }
  }
)

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load vendors"
      })
      .addCase(triggerVendor.pending, (state, action) => {
        state.triggeringId = action.meta.arg
      })
      .addCase(triggerVendor.fulfilled, (state) => {
        state.triggeringId = null
      })
      .addCase(triggerVendor.rejected, (state) => {
        state.triggeringId = null
      })
  },
})

export const selectVendors = (state: RootState) => state.vendors.list
export const selectVendorsStatus = (state: RootState) => state.vendors.status
export const selectVendorsError = (state: RootState) => state.vendors.error
export const selectTriggeringVendorId = (state: RootState) => state.vendors.triggeringId
export const vendorsReducer = vendorsSlice.reducer
