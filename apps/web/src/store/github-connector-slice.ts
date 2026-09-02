import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { qaAgentAxiosInstance } from "@/lib/axios-instance"
import type { RootState } from "@/store/store"

export type GithubRepository = {
  owner: string
  name: string
  full_name: string
  default_branch: string
  description: string | null
  is_private: boolean
  html_url: string | null
}

export type GithubBranch = {
  name: string
  protected: boolean
  commit_sha: string | null
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed"
type Fetchable<T> = { data: T; status: AsyncStatus; error: string | null }

type GithubConnectorState = {
  repos: Fetchable<GithubRepository[]>
  branches: Record<string, Fetchable<GithubBranch[]>>
}

const initialState: GithubConnectorState = {
  repos: { data: [], status: "idle", error: null },
  branches: {},
}

export const fetchGithubRepos = createAsyncThunk("githubConnector/fetchRepos", async () => {
  const response = await qaAgentAxiosInstance.get<{ repositories: GithubRepository[] }>(
    "/api/github/repos"
  )
  return response.data.repositories
})

export const fetchGithubBranches = createAsyncThunk(
  "githubConnector/fetchBranches",
  async ({ owner, repo }: { owner: string; repo: string }) => {
    const response = await qaAgentAxiosInstance.get<{ branches: GithubBranch[] }>(
      `/api/github/repos/${owner}/${repo}/branches`
    )
    return { repoKey: `${owner}/${repo}`, branches: response.data.branches }
  }
)

const githubConnectorSlice = createSlice({
  name: "githubConnector",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGithubRepos.pending, (state) => {
        state.repos.status = "loading"
        state.repos.error = null
      })
      .addCase(fetchGithubRepos.fulfilled, (state, action) => {
        state.repos.status = "succeeded"
        state.repos.data = action.payload
      })
      .addCase(fetchGithubRepos.rejected, (state, action) => {
        state.repos.status = "failed"
        state.repos.error = action.error.message ?? "Failed to load GitHub repositories"
      })
      .addCase(fetchGithubBranches.pending, (state, action) => {
        const key = `${action.meta.arg.owner}/${action.meta.arg.repo}`
        state.branches[key] = {
          data: state.branches[key]?.data ?? [],
          status: "loading",
          error: null,
        }
      })
      .addCase(fetchGithubBranches.fulfilled, (state, action) => {
        state.branches[action.payload.repoKey] = {
          data: action.payload.branches,
          status: "succeeded",
          error: null,
        }
      })
      .addCase(fetchGithubBranches.rejected, (state, action) => {
        const key = `${action.meta.arg.owner}/${action.meta.arg.repo}`
        state.branches[key] = {
          data: [],
          status: "failed",
          error: action.error.message ?? "Failed to load branches",
        }
      })
  },
})

export const selectGithubRepos = (state: RootState) => state.githubConnector.repos
export const selectGithubBranches = (repoKey: string) => (state: RootState) =>
  state.githubConnector.branches[repoKey]
export const githubConnectorReducer = githubConnectorSlice.reducer
