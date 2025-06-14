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

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total Funded</span>
            <span className="font-medium text-slate-900">{fundingList.totalFunded} ₳</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Monthly Budget</span>
            <span className="font-medium text-slate-900">{fundingList.monthlyBudget} ₳</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Projects</span>
            <span className="font-medium text-slate-900">{fundingList.projects.length}</span>
          </div>
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