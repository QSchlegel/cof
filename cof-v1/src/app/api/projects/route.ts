import { NextResponse } from 'next/server';
import type { Project } from '@/shared/types';

// Mock data for now
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Example Project 1",
    description: "A sample open source project",
    repositoryUrl: "https://github.com/example/project1",
    platform: "github",
    dependencies: ["react", "typescript"],
    fundingAddress: "addr1...",
    totalFunded: "10,000",
    contributors: 5
  },
  {
    id: "2",
    name: "Example Project 2",
    description: "Another sample open source project",
    repositoryUrl: "https://gitlab.com/example/project2",
    platform: "gitlab",
    dependencies: ["vue", "javascript"],
    fundingAddress: "addr1...",
    totalFunded: "5,000",
    contributors: 3
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const platform = searchParams.get('platform') || 'all';

  let filteredProjects = mockProjects;

  if (query) {
    filteredProjects = filteredProjects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (platform !== 'all') {
    filteredProjects = filteredProjects.filter(project => 
      project.platform === platform
    );
  }

  return NextResponse.json(filteredProjects);
} 