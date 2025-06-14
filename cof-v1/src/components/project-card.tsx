import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, GitBranch, Users, DollarSign } from "lucide-react";
import type { Project } from "@/shared/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {project.platform}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-sm text-slate-600">
          <GitBranch className="w-4 h-4 mr-2" />
          <span>{project.dependencies.length} dependencies</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{project.contributors} contributors</span>
          </div>
          <div className="flex items-center text-slate-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>{project.totalFunded} ₳</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              View Repository
            </a>
          </Button>
          <Button className="flex-1">Fund Project</Button>
        </div>
      </div>
    </Card>
  );
}
