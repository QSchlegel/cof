import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, GitBranch, Star, Users } from "lucide-react"
import type { Project } from "@/shared/types"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-2">
              {project.description}
            </p>
          </div>
          <Badge variant="outline" className="ml-2">
            {project.platform}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{project.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            <span>{project.forks}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{project.contributors}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total Funded</span>
            <span className="font-medium text-slate-900">{project.totalFunded} ₳</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Monthly Funding</span>
            <span className="font-medium text-slate-900">{project.monthlyFunding} ₳</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(project.repositoryUrl, "_blank")}
          >
            <Github className="w-4 h-4 mr-2" />
            View Repository
          </Button>
          <Button className="flex-1">Fund Project</Button>
        </div>
      </CardContent>
    </Card>
  )
} 