import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { axiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type KnowledgeTab = "sources" | "kb" | "policies"

export type KnowledgeSource = {
  id: string
  name: string
  status: string
  documentsIndexed: number
  lastSync: string
  owner: string
}

export type KbArticle = {
  id: string
  title: string
  type: string
  summary: string
}

export type Policy = {
  id: string
  title: string
  version: string
  owner: string
  effectiveDate: string
  approvalMode: string
  applicablePipelines: string[]
  body: string
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type KnowledgeState = {
  activeTab: KnowledgeTab
  kbSearch: string
  sources: Fetchable<KnowledgeSource[]>
  articles: Fetchable<KbArticle[]>
  policies: Fetchable<Policy[]>
  currentArticle: Fetchable<KbArticle | null>
}

const initialState: KnowledgeState = {
  activeTab: "sources",
  kbSearch: "",
  sources: { data: [], status: "idle", error: null },
  articles: { data: [], status: "idle", error: null },
  policies: { data: [], status: "idle", error: null },
  currentArticle: { data: null, status: "idle", error: null },
}

export const fetchKnowledgeSources = createAsyncThunk(
  "knowledge/fetchKnowledgeSources",
  async () => {
    const response = await axiosInstance.get<{ sources: KnowledgeSource[] }>(
      "/knowledge/sources"
    )
    return response.data.sources
  }
)

export const fetchKbArticles = createAsyncThunk(
  "knowledge/fetchKbArticles",
  async () => {
    const response = await axiosInstance.get<{ articles: KbArticle[] }>(
      "/knowledge/articles"
    )
    return response.data.articles
  }
)

export const fetchKbArticleById = createAsyncThunk(
  "knowledge/fetchKbArticleById",
  async (articleId: string) => {
    const response = await axiosInstance.get<KbArticle>(
      `/knowledge/articles/${articleId}`
    )
    return response.data
  }
)

export const fetchPolicies = createAsyncThunk(
  "knowledge/fetchPolicies",
  async () => {
    const response = await axiosInstance.get<{ policies: Policy[] }>(
      "/knowledge/policies"
    )
    return response.data.policies
  }
)

export const fetchPolicyById = createAsyncThunk(
  "knowledge/fetchPolicyById",
  async (policyId: string) => {
    const response = await axiosInstance.get<Policy>(
      `/knowledge/policies/${policyId}`
    )
    return response.data
  }
)

const knowledgeSlice = createSlice({
  name: "knowledge",
  initialState,
  reducers: {
    setKnowledgeTab: (state, action: PayloadAction<KnowledgeTab>) => {
      state.activeTab = action.payload
    },
    setKbSearch: (state, action: PayloadAction<string>) => {
      state.kbSearch = action.payload
    },
    addKbArticle: (
      state,
      action: PayloadAction<{ id: string; type: string; title: string; when: string; tag: string }>
    ) => {
      state.articles.data.unshift({
        id: action.payload.id,
        title: action.payload.title,
        type: action.payload.type,
        summary: action.payload.tag,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeSources.pending, (state) => {
        state.sources.status = "loading"
      })
      .addCase(fetchKnowledgeSources.fulfilled, (state, action) => {
        state.sources.status = "succeeded"
        state.sources.data = action.payload
      })
      .addCase(fetchKnowledgeSources.rejected, (state, action) => {
        state.sources.status = "failed"
        state.sources.error = action.error.message ?? "Failed to load sources"
      })
      .addCase(fetchKbArticles.pending, (state) => {
        state.articles.status = "loading"
      })
      .addCase(fetchKbArticles.fulfilled, (state, action) => {
        state.articles.status = "succeeded"
        state.articles.data = action.payload
      })
      .addCase(fetchKbArticles.rejected, (state, action) => {
        state.articles.status = "failed"
        state.articles.error = action.error.message ?? "Failed to load articles"
      })
      .addCase(fetchKbArticleById.pending, (state) => {
        state.currentArticle.status = "loading"
      })
      .addCase(fetchKbArticleById.fulfilled, (state, action) => {
        state.currentArticle.status = "succeeded"
        state.currentArticle.data = action.payload
      })
      .addCase(fetchKbArticleById.rejected, (state, action) => {
        state.currentArticle.status = "failed"
        state.currentArticle.error = action.error.message ?? "Failed to load article"
      })
      .addCase(fetchPolicies.pending, (state) => {
        state.policies.status = "loading"
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.policies.status = "succeeded"
        state.policies.data = action.payload
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.policies.status = "failed"
        state.policies.error = action.error.message ?? "Failed to load policies"
      })
      .addCase(fetchPolicyById.fulfilled, (state, action) => {
        const index = state.policies.data.findIndex((policy) => policy.id === action.payload.id)
        if (index === -1) {
          state.policies.data.push(action.payload)
        } else {
          state.policies.data[index] = action.payload
        }
      })
  },
})

export const { setKnowledgeTab, setKbSearch, addKbArticle } = knowledgeSlice.actions
export const selectKnowledgeActiveTab = (state: RootState) => state.knowledge.activeTab
export const selectKbSearch = (state: RootState) => state.knowledge.kbSearch
export const selectKnowledgeSources = (state: RootState) => state.knowledge.sources
export const selectKbArticles = (state: RootState) => state.knowledge.articles
export const selectCurrentKbArticle = (state: RootState) => state.knowledge.currentArticle
export const selectPolicies = (state: RootState) => state.knowledge.policies
export const knowledgeReducer = knowledgeSlice.reducer
