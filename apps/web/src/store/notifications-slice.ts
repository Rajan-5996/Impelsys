import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type NotificationLink = {
  screen: string
  id: string
}

export type AppNotification = {
  severity: "critical" | "high" | "medium" | string
  title: string
  meta: string
  link: NotificationLink
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type NotificationsState = {
  items: AppNotification[]
  status: AsyncStatus
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  status: "idle",
  error: null,
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async () => {
    const response = await axiosInstance.get<{ items: AppNotification[] }>(
      "/notifications"
    )
    return response.data.items
  }
)

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load notifications"
      })
  },
})

export const selectNotifications = (state: RootState) => state.notifications.items
export const selectNotificationsStatus = (state: RootState) => state.notifications.status
export const notificationsReducer = notificationsSlice.reducer
