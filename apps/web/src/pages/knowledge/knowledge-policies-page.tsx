import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { KnowledgeBaseTab } from "@/pages/knowledge/tabs/knowledge-base-tab"
import { PoliciesTab } from "@/pages/knowledge/tabs/policies-tab"
import { SourcesTab } from "@/pages/knowledge/tabs/sources-tab"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  selectKnowledgeActiveTab,
  setKnowledgeTab,
  type KnowledgeTab,
} from "@/store/knowledge-slice"

const TAB_LABELS: Record<KnowledgeTab, string> = {
  sources: "Sources",
  kb: "Knowledge Base",
  policies: "Policies",
}

export function KnowledgePoliciesPage() {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(selectKnowledgeActiveTab)

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs trail={[{ label: "Knowledge & Policies" }]} />
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Knowledge & Policies
        </h1>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Connected knowledge sources, the agent knowledge base, and governance
          policies
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          dispatch(setKnowledgeTab(value as KnowledgeTab))
        }
      >
        <TabsList>
          {(Object.keys(TAB_LABELS) as KnowledgeTab[]).map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="sources">
          <SourcesTab />
        </TabsContent>
        <TabsContent value="kb">
          <KnowledgeBaseTab />
        </TabsContent>
        <TabsContent value="policies">
          <PoliciesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
