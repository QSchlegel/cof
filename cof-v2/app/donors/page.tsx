"use client";

import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { FundingListCard } from "@/components/funding-list-card";
import type { FundingList } from "@/shared/types";
import { getProvider } from "@/utils/get-provider";
import { Asset, MeshTxBuilder } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";


// Mock funding list data
const mockFundingList: FundingList = {
  id: "mock-id",
  name: "Mock Funding List",
  description: "This is a mock funding list filled with sample projects.",
  monthlyBudget: "300",
  userId: "mock-user",
  projects: [
    {
      id: "p1",
      distributionPercentage: 40,
      project: {
        id: "proj1",
        name: "Open Source Wallet",
        repository: "github.com/org/wallet",
        dependencies: [
          { name: "Cardano Serialization Lib", weight: 0.9 },
          { name: "Lucide Icons", weight: 0.5 },
          { name: "Tailwind CSS", weight: 0.7 }
        ],
      },
    },
    {
      id: "p2",
      distributionPercentage: 30,
      project: {
        id: "proj2",
        name: "Smart Contract Platform",
        repository: "github.com/org/contracts",
        dependencies: [
          { name: "Cardano Serialization Lib", weight: 0.9 },
          { name: "Lucide Icons", weight: 0.5 },
          { name: "Tailwind CSS", weight: 0.7 }
        ],
      },
    },
    {
      id: "p3",
      distributionPercentage: 30,
      project: {
        id: "proj3",
        name: "Developer Toolkit",
        repository: "github.com/org/toolkit",
        dependencies: [
          { name: "Cardano Serialization Lib", weight: 0.9 },
          { name: "Lucide Icons", weight: 0.5 },
          { name: "Tailwind CSS", weight: 0.7 }
        ],
      },
    },
  ],
};


export default function DonorsPage() {
  const { wallet, connected} = useWallet()

    async function distributeDonation() {
    

    if (!connected) throw new Error("Wallet not connected");
    const userAddress = await wallet.getChangeAddress();

    const hardcodePayout: Record<string, Asset[]> = {
      ["addr_test1qpgq20nr526e5mwss5hs05dgn5gjp8835t984lnfvvzw9krrh0tzml8zqzw2lmx7yxtwftvl0c04w9mjuq5frsfg9qks42xprf"]: [{ unit: "lovelace", quantity: '84000000' }],
      ["addr_test1qpv9htlzg7y5tl6fqvnnpdyaf9fx9x8t48f8944x6gr8jdjss378p3u5jfs273dz7r7u6vdvfpcelt3e5jq6zhd8h2ps56y2z9"]: [{ unit: "lovelace", quantity: '63000000' }],
      ["addr_test1qryd82l5mmkn6mywagn3v5683fy8ttywv9wph26vtupmvtufkxmcqqgzau2du8ftn7kf5lt8cl9h5x625vs8syghu27s4j9r0x"]: [{ unit: "lovelace", quantity: '63000000' }],
      ["addr_test1qrn0sdzd5uedckwkekg5tc3c2n89cltk8fvxqnuldf6juk7uhpjsp303wp52893r66exfuyalfyfhdqksme845zcu9aqfcl6fa"]: [{ unit: "lovelace", quantity: '38570000' }],
      ["addr_test1qpqu0j8ha44psz4v7x0jlrg57wqtvqvast7w9n9z8yaxtqx9njhe9y52q3mfd576wcrrf7a6ez4ck62rcthsm42sc0qsnec3ty"]: [{ unit: "lovelace", quantity: '21430000' }],
      ["addr_test1qz29ynh5jnynr0ldqj7h9e9l6wlry3uzwy568st7dq06qryaafzvtmqm9cpejnek5s5sdegk0e7yw0v5xg4mnqswzhtq23amh3"]: [{ unit: "lovelace", quantity: '30000000' }],
    }

    try {
      const provider = getProvider(0)
      const txBuilder = new MeshTxBuilder({
        fetcher: provider
      });
      for (const recipient in hardcodePayout) {
        const outputValue = hardcodePayout[recipient]
        txBuilder.txOut(recipient, outputValue);
      }
      const utxos = await wallet.getUtxos()
      const unsignedTx = await txBuilder.changeAddress(userAddress).selectUtxosFrom(utxos).complete();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

    } catch (e) {
    }
  }

  // Calculate aggregated funding distribution from mockFundingList
  const calculateAggregatedDistribution = () => {
    // Since we only have one funding list, just use its projects
    return mockFundingList.projects.map((fundingProject) => {
      const totalBudget = parseFloat(mockFundingList.monthlyBudget);
      const allocation = (totalBudget * fundingProject.distributionPercentage) / 100;

      const dependencyShare = 0.3; // 30% to dependencies
      const projectShare = allocation * (1 - dependencyShare);

      const dependencies = fundingProject.project.dependencies || [];
      const totalWeight = dependencies.reduce((sum, d) => sum + d.weight, 0);

      const dependencyAllocations = dependencies.map((dep) => ({
        name: dep.name,
        ada: totalWeight > 0 ? (allocation * dependencyShare * dep.weight) / totalWeight : 0,
      }));

      return {
        ...fundingProject.project,
        averageAllocation: projectShare.toFixed(2),
        totalAllocation: projectShare.toFixed(2),
        usageCount: 1,
        dependencies,
        dependencyAllocations,
      };
    });
  };

  const aggregatedProjects = calculateAggregatedDistribution();
  const totalMonthlyBudget = aggregatedProjects
    .reduce((sum, p) => sum + parseFloat(p.averageAllocation), 0)
    .toFixed(2);
  const averageDistribution =
    aggregatedProjects.length > 0
      ? (
          aggregatedProjects.reduce((sum, p) => sum + p.usageCount, 0) /
          aggregatedProjects.length
        ).toFixed(1)
      : "0.0";

  // --- Dependency Fund Allocation Calculation ---
  const flattenedDependencies = aggregatedProjects.flatMap((project) => {
    return project.dependencyAllocations || [];
  });

  const aggregatedDependencies = flattenedDependencies.reduce((acc, curr) => {
    if (!acc[curr.name]) {
      acc[curr.name] = { name: curr.name, ada: 0 };
    }
    acc[curr.name].ada += curr.ada;
    return acc;
  }, {} as Record<string, { name: string; ada: number }>);

  const uniqueDependencies = Object.values(aggregatedDependencies).map((dep) => ({
    ...dep,
    ada: dep.ada.toFixed(2),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 shadow-md mb-12 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Become a Donor</h1>
          <p className="text-lg text-slate-600 mb-6">
            Support the projects and their critical dependencies that power the open-source ecosystem. Every contribution helps sustain innovation.
          </p>
          <Button className="gradient-bg text-white text-lg px-8 py-4">
            <ArrowUpRight className="w-5 h-5 mr-2" />
            Start Donating
          </Button>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          <div className="space-y-2">
            <FundingListCard fundingList={mockFundingList} />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Amount in ₳"
                className="w-full"
              />
              <Button className="gradient-bg text-white" >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Send Donation
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Aggregated Funding
              </h3>
              <p className="text-slate-600">
                Overview of all projects across your funding lists
              </p>
            </div>
          </div>
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">
                    Total Monthly Budget
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {totalMonthlyBudget} ₳
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">
                    Projects Supported
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {aggregatedProjects.length}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">
                    Avg. Lists per Project
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {averageDistribution}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        Total Allocation
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        Avg. per List
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        Lists
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedProjects.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-500"
                        >
                          No projects in funding lists yet
                        </td>
                      </tr>
                    ) : (
                      aggregatedProjects.map((project) => (
                        <tr
                          key={project.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                {/* Could use a project icon here */}
                                <span role="img" aria-label="project">📦</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {project.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {project.repository}
                                </p>
                                {project.dependencies && (
                                  <ul className="text-xs text-slate-400 list-disc list-inside mt-1">
                                    {project.dependencies.map((dep, index) => (
                                      <li key={index}>{dep.name} ({Math.round(dep.weight * 100)}%)</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-900">
                            {project.totalAllocation} ₳
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-900">
                            {project.averageAllocation} ₳
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {project.usageCount} lists
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
        {/* Project Dependencies Overview Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Project Dependencies Overview
          </h3>
          <Card>
            <div className="p-6 space-y-6">
              {aggregatedProjects.map((project) => (
                <div key={project.id}>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">
                    {project.name}
                  </h4>
                  <ul className="space-y-1">
                    {project.dependencies?.map((dep, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{dep.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-48 bg-slate-200 rounded h-2">
                            <div
                              className="bg-blue-500 h-2 rounded"
                              style={{ width: `${dep.weight * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-500">{Math.round(dep.weight * 100)}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Fund Distribution Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-slate-900">
              Fund Distribution
            </h3>
            <Button className="gradient-bg text-white" onClick={()=>{distributeDonation()}}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Distribute Funds
            </Button>
          </div>
          {/* Project and Dependency Fund Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-green-500 shadow-md">
              <div className="p-6">
                <h4 className="text-xl font-bold text-green-800 mb-4">Project Fund Allocation</h4>
                <ul className="space-y-2">
                  {aggregatedProjects.map((proj) => (
                    <li key={proj.id} className="flex justify-between text-sm">
                      <span className="text-slate-700">{proj.name}</span>
                      <span className="text-green-700 font-semibold">{proj.totalAllocation} ₳</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <Card className="border-2 border-blue-500 shadow-md">
              <div className="p-6">
                <h4 className="text-xl font-bold text-blue-800 mb-4">Dependency Fund Allocation</h4>
                <ul className="space-y-2">
                  {uniqueDependencies.map((dep) => (
                    <li key={dep.name} className="flex justify-between text-sm">
                      <span className="text-slate-700">{dep.name}</span>
                      <span className="text-blue-700 font-semibold">{dep.ada} ₳</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
