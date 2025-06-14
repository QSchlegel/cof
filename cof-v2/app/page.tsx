'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { ProjectCard } from "@/components/project-card";
import { 
  Search, 
  Plus, 
  GitBranch, 
  TrendingUp, 
  Users, 
  DollarSign,
  Github,
  Shield,
  BarChart3,
  ArrowRight,
  Star,
  ExternalLink,
  Download,
  Filter,
  Package,
  Settings,
  Gitlab,
  GitFork,
  Network,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users2
} from "lucide-react";
import type { Project } from "@/shared/types";
import { useWallet } from "@meshsdk/react";
import ConnectWallet from "@/components/connect-wallet";
import Link from "next/link";
import { Header } from "@/components/header";
import { useFundingStore } from "@/store/use-funding-store";
import { ParticlesBackground } from "@/components/particles-background";

export default function HomePage() {
  const { connected } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const { toast } = useToast();

  // Mock data for now - will be replaced with actual API calls
  const stats = {
    totalFunded: "0",
    projectsSupported: 0,
    activeDonors: 0
  };

  // Mock projects data
  const projects: Project[] = [
    {
      id: "1",
      name: "React",
      description: "A JavaScript library for building user interfaces",
      repository: "facebook/react",
      platform: "github",
      stars: "210000",
      dependencies: ["react-dom", "scheduler", "prop-types"],
      monthlyFunding: "100",
      status: "active"
    },
    {
      id: "2",
      name: "Next.js",
      description: "The React Framework for Production",
      repository: "vercel/next.js",
      platform: "github",
      stars: "115000",
      dependencies: ["react", "react-dom", "webpack"],
      monthlyFunding: "150",
      status: "active"
    },
    {
      id: "3",
      name: "Tailwind CSS",
      description: "A utility-first CSS framework",
      repository: "tailwindlabs/tailwindcss",
      platform: "github",
      stars: "75000",
      dependencies: ["postcss", "autoprefixer"],
      monthlyFunding: "75",
      status: "pending"
    }
  ];

  // Filter projects based on search query and platform
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.repository.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || project.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section with Cardano blue gradient and dynamic particles background */}
      <section className="relative min-h-[500px] py-24 bg-gradient-to-br from-cardano-600 via-cardano-500 to-cardano-700 text-white shadow-lg overflow-hidden">
        <ParticlesBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
              Fund Open Source,<br />
              <span className="text-cardano-100">Build the Future</span>
            </h1>
            <p className="text-lg mb-10 text-cardano-100 max-w-2xl mx-auto">
              Support your favorite open-source projects with ADA donations. Create funding lists, track dependencies, and ensure maintainers get rewarded for their contributions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 rounded-xl p-6 shadow-md border border-cardano-200">
                <div className="text-3xl font-bold text-white">0 ₳</div>
                <div className="text-cardano-100 mt-2">Total Funded</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 shadow-md border border-cardano-200">
                <div className="text-3xl font-bold text-white">0</div>
                <div className="text-cardano-100 mt-2">Projects Supported</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 shadow-md border border-cardano-200">
                <div className="text-3xl font-bold text-white">0</div>
                <div className="text-cardano-100 mt-2">Active Donors</div>
              </div>
            </div>
            <Button className="bg-white text-cardano-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-cardano-100 hover:text-cardano-800 transition">
              Start Funding Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Project Discovery */}
      <section id="discover" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Discover Projects</h3>
            <p className="text-lg text-slate-600">Browse and search for open-source projects to support</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg shadow-sm"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <GitBranch className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-900 mb-2">No projects found</h4>
                <p className="text-slate-600">Try adjusting your search criteria or add a new project.</p>
              </div>
            ) : (
              filteredProjects.map((project: Project) => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} />
                  <Link href="/donors">
                    <Button
                      className="absolute top-4 right-4 z-10 gradient-bg text-white"
                      size="sm"
                    >
                      Add to List
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Dependency Aggregation View */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Dependency Overview</h3>
                <p className="text-slate-600">Shared dependencies across your funded projects</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Unique Dependencies</p>
                    <p className="text-2xl font-bold text-slate-900">32</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Most Shared</p>
                    <p className="text-2xl font-bold text-slate-900">lodash</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Avg. Usage</p>
                    <p className="text-2xl font-bold text-slate-900">3.2</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Dependency</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Used By</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Allocation</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                              <Package className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">lodash</p>
                              <p className="text-xs text-slate-500">4.17.21</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">R</div>
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-800">N</div>
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800">T</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">125 ₳</td>
                        <td className="py-4 px-4">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Dashboard */}
      <section id="transparency" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Transparency Dashboard</h3>
            <p className="text-lg text-slate-600">All funding flows are public and auditable</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Funding Stats */}
            <div className="space-y-6">
              <Card className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Funding Statistics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Distributed</span>
                    <span className="font-semibold text-slate-900">{stats.totalFunded} ₳</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Projects</span>
                    <span className="font-semibold text-slate-900">{stats.projectsSupported}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Donors</span>
                    <span className="font-semibold text-slate-900">{stats.activeDonors}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Dependency Graph Visualization */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-slate-900">Dependency Flow Visualization</h4>
                  <div className="flex space-x-2">
                    <Badge variant="default">Live</Badge>
                    <Button variant="ghost" size="sm">24h</Button>
                    <Button variant="ghost" size="sm">7d</Button>
                  </div>
                </div>

                <div className="relative h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Interactive dependency graph visualization</p>
                    <p className="text-slate-400 text-xs mt-1">Shows funding flows between projects and dependencies</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 cardano-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">COF</span>
              </div>
              <p className="text-slate-400 mb-4">Democratizing open-source funding through blockchain technology.</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Platform</h5>
              <ul className="space-y-2 text-slate-400">
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">How it Works</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">For Donors</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">For Maintainers</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">API Documentation</Button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-slate-400">
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Smart Contracts</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Security Audit</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Cardano Integration</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Support</Button></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Open Source</h5>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Button 
                    variant="link" 
                    className="text-slate-400 hover:text-white p-0 h-auto"
                    onClick={() => window.open("https://github.com/QSchlegel/cof", "_blank")}
                  >
                    GitHub Repository
                  </Button>
                </li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Contribute</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">License</Button></li>
                <li><Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto">Roadmap</Button></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">© 2024 COF - Cardano Open Funding. Open source and community-driven.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-slate-400">
              <Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto text-sm">Privacy Policy</Button>
              <Button variant="link" className="text-slate-400 hover:text-white p-0 h-auto text-sm">Terms of Service</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
