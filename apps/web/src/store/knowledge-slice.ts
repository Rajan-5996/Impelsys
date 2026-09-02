import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { KB_ARTICLES, type KbArticle } from "@/data/knowledge"
import type { RootState } from "@/store/store"

export type KnowledgeTab = "sources" | "kb" | "policies"

type KnowledgeState = {
  articles: KbArticle[]
  activeTab: KnowledgeTab
  kbSearch: string
}

const initialState: KnowledgeState = {
  articles: KB_ARTICLES,
  activeTab: "sources",
  kbSearch: "",
}

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
    addKbArticle: (state, action: PayloadAction<KbArticle>) => {
      state.articles.unshift(action.payload)
    },
  },
})

export const { setKnowledgeTab, setKbSearch, addKbArticle } =
  knowledgeSlice.actions
export const selectKbArticles = (state: RootState) => state.knowledge.articles
export const selectKnowledgeActiveTab = (state: RootState) =>
  state.knowledge.activeTab
export const selectKbSearch = (state: RootState) => state.knowledge.kbSearch
export const knowledgeReducer = knowledgeSlice.reducer
