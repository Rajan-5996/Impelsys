import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { RootState } from "@/store/store"

export type ModalDescriptor =
  | { type: "confirm"; action: "acknowledge-northstar" | "reject-northstar" | "reject-etl" }
  | { type: "modify-action" }
  | { type: "compare-resolution"; similarId: string }
  | { type: "affected-records"; ruleId: string }
  | { type: "lineage"; ruleId: string }
  | { type: "audit-detail"; entryId: string }
  | { type: "kb-article"; articleId: string }
  | { type: "help" }

export type DrawerDescriptor =
  | { type: "stage-detail"; stageIndex: number }
  | { type: "scorecard"; supplierId: string }
  | { type: "agent-activity"; agentId: string }

export type ToastVariant = "success" | "info" | "warn"

export type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

export type AskMessageLink = {
  label: string
  path: string
}

export type AskMessage = {
  id: string
  role: "user" | "agent"
  text: string
  link?: AskMessageLink
}

type UiState = {
  modal: ModalDescriptor | null
  drawer: DrawerDescriptor | null
  toasts: Toast[]
  environment: "Production" | "Pre-Production" | "QA"
  ask: {
    open: boolean
    greeted: boolean
    messages: AskMessage[]
  }
}

const initialState: UiState = {
  modal: null,
  drawer: null,
  toasts: [],
  environment: "Production",
  ask: {
    open: false,
    greeted: false,
    messages: [],
  },
}

let toastCounter = 0

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalDescriptor>) => {
      state.modal = action.payload
    },
    closeModal: (state) => {
      state.modal = null
    },
    openDrawer: (state, action: PayloadAction<DrawerDescriptor>) => {
      state.drawer = action.payload
    },
    closeDrawer: (state) => {
      state.drawer = null
    },
    pushToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.toasts.push(action.payload)
      },
      prepare: (message: string, variant: ToastVariant = "info") => ({
        payload: { id: `toast-${Date.now()}-${toastCounter++}`, message, variant },
      }),
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    setEnvironment: (
      state,
      action: PayloadAction<UiState["environment"]>
    ) => {
      state.environment = action.payload
    },
    openAsk: (state) => {
      state.ask.open = true
      if (!state.ask.greeted) {
        state.ask.greeted = true
        state.ask.messages.push({
          id: "ask-greeting",
          role: "agent",
          text: "Ask me about supplier feeds, incidents, or pipeline status.",
        })
      }
    },
    closeAsk: (state) => {
      state.ask.open = false
    },
    sendAskMessage: (state, action: PayloadAction<AskMessage[]>) => {
      state.ask.messages.push(...action.payload)
    },
  },
})

export const {
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  pushToast,
  dismissToast,
  setEnvironment,
  openAsk,
  closeAsk,
  sendAskMessage,
} = uiSlice.actions

export const selectModal = (state: RootState) => state.ui.modal
export const selectDrawer = (state: RootState) => state.ui.drawer
export const selectToasts = (state: RootState) => state.ui.toasts
export const selectEnvironment = (state: RootState) => state.ui.environment
export const selectAsk = (state: RootState) => state.ui.ask
export const uiReducer = uiSlice.reducer
