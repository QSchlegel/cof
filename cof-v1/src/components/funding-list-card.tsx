import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, GitBranch } from "lucide-react";
import type { FundingList } from "@/shared/types";

interface FundingListCardProps {
  fundingList: FundingList;
}

export function FundingListCard({ fundingList }: FundingListCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{fundingList.name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{fundingList.description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-600">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>{fundingList.projects.length} projects</span>
          </div>
          <div className="flex items-center text-slate-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>{fundingList.totalFunded} ₳</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">View Details</Button>
          <Button className="flex-1">Fund List</Button>
        </div>
      </div>
    </Card>
  );
}
