import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type Agent = {
  id: string
  name: string
  scope: string
  governanceMode: string
  status: string
  currentTask: string
  actionsToday: number
  successRate: number
  avgResolutionTimeMinutes: number
  awaitingApproval: number
}

export type AgentActivityStep = {
  step: string
  status: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"

type ActivityEntry = {
  timeline: AgentActivityStep[]
  status: AsyncStatus
  error: string | null
}

type AgentsState = {
  list: Agent[]
  status: AsyncStatus
  error: string | null
  activity: Record<string, ActivityEntry>
}

const initialState: AgentsState = {
  list: [],
  status: "idle",
  error: null,
  activity: {},
}

export const fetchAgents = createAsyncThunk("agents/fetchAgents", async () => {
  const response = await axiosInstance.get<{ agents: Agent[] }>("/api/agents")
  return response.data.agents
})

export const fetchAgentActivity = createAsyncThunk(
  "agents/fetchAgentActivity",
  async (agentId: string) => {
    const response = await axiosInstance.get<{ timeline: AgentActivityStep[] }>(
      `/api/agents/${agentId}/activity`
    )
    return { agentId, timeline: response.data.timeline }
  }
)

export const setGovernanceMode = createAsyncThunk(
  "agents/setGovernanceMode",
  async (payload: {
    agentId: string
    policyId: string
    mode: string
    updatedBy?: string
  }) => {
    const response = await axiosInstance.post(
      `/api/agents/${payload.agentId}/governance-mode`,
      {
        policy_id: payload.policyId,
        mode: payload.mode,
        updated_by: payload.updatedBy ?? "dataops_lead",
      }
    )
    return response.data
  }
)

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.list = action.payload
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message ?? "Failed to load agents"
      })
      .addCase(fetchAgentActivity.pending, (state, action) => {
        state.activity[action.meta.arg] = {
          timeline: state.activity[action.meta.arg]?.timeline ?? [],
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchAgentActivity.fulfilled, (state, action) => {
        state.activity[action.payload.agentId] = {
          timeline: action.payload.timeline,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchAgentActivity.rejected, (state, action) => {
        state.activity[action.meta.arg] = {
          timeline: [],
          status: "failed",
          error: action.error.message ?? "Failed to load agent activity",
        }
      })
  },
})

export const selectAgents = (state: RootState) => state.agents.list
export const selectAgentsStatus = (state: RootState) => state.agents.status
export const selectAgentsError = (state: RootState) => state.agents.error
export const selectAgentActivity = (agentId: string) => (state: RootState) =>
  state.agents.activity[agentId]
export const agentsReducer = agentsSlice.reducer
