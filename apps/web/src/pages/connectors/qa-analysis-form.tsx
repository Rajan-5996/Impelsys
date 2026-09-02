import { useEffect, useMemo, useState } from "react"
import { ZapIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { fetchGithubBranches, fetchGithubRepos, selectGithubBranches, selectGithubRepos } from "@/store/github-connector-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchTestingTypes, qaAnalysisReset, runQaAnalysis, selectQaAgent } from "@/store/qa-agent-slice"

export function QaAnalysisForm() {
  const dispatch = useAppDispatch()
  const repos = useAppSelector(selectGithubRepos)
  const qaAgent = useAppSelector(selectQaAgent)
  const [owner, setOwner] = useState("")
  const [repository, setRepository] = useState("")
  const [branch, setBranch] = useState("")
  const [testingType, setTestingType] = useState("")

  const selectedRepo = useMemo(
    () => repos.data.find((repo) => repo.owner === owner && repo.name === repository) ?? null,
    [repos.data, owner, repository]
  )
  const branches = useAppSelector(selectGithubBranches(selectedRepo?.full_name ?? ""))

  useEffect(() => {
    dispatch(fetchGithubRepos())
    dispatch(fetchTestingTypes())
  }, [dispatch])

  function handleRepoChange(fullName: string | null) {
    const repo = repos.data.find((item) => item.full_name === fullName)
    setOwner(repo?.owner ?? "")
    setRepository(repo?.name ?? "")
    setBranch(repo?.default_branch ?? "")
    if (repo) dispatch(fetchGithubBranches({ owner: repo.owner, repo: repo.name }))
  }

  async function handleSubmit() {
    if (!owner || !repository || !branch || !testingType) return
    dispatch(qaAnalysisReset())
    await dispatch(runQaAnalysis({ owner, repository, branch, testing_type: testingType }))
  }

  const canSubmit = Boolean(owner && repository && branch && testingType) && !qaAgent.streaming

  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Run QA Analysis
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select value={selectedRepo?.full_name ?? ""} onValueChange={handleRepoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Repository" />
          </SelectTrigger>
          <SelectContent>
            {repos.data.map((repo) => (
              <SelectItem key={repo.full_name} value={repo.full_name}>
                {repo.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={branch} onValueChange={(value) => setBranch(value ?? "")} disabled={!selectedRepo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            {(branches?.data ?? []).map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={testingType} onValueChange={(value) => setTestingType(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Testing Type" />
          </SelectTrigger>
          <SelectContent>
            {qaAgent.testingTypes.data.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-fit">
        <ZapIcon />
        {qaAgent.streaming ? "Analyzing..." : "Run Analysis"}
      </Button>
    </div>
  )
}
