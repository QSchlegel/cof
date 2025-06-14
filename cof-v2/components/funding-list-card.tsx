import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Plus } from "lucide-react"
import type { FundingList } from "@/shared/types"

interface FundingListCardProps {
  fundingList: FundingList
}

export function FundingListCard({ fundingList }: FundingListCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {fundingList.name}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {fundingList.description}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 font-medium mb-2">Projects</p>
          <ul className="space-y-1">
            {fundingList.projects.length === 0 ? (
              <li className="text-sm text-slate-500 italic">No projects added yet</li>
            ) : (
              fundingList.projects.map((fp) => (
                <li key={fp.id} className="text-sm text-slate-900 flex justify-between">
                  <span className="truncate">{fp.project.name}</span>
                  <span className="text-slate-500">{fp.distributionPercentage}%</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
          <Button className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 