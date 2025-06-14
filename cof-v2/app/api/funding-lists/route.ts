import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const lists = await prisma.fundingList.findMany({
      where: {
        userId,
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching funding lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch funding lists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, monthlyBudget, userId, projects = [] } = body;

    // Create the funding list
    const fundingList = await prisma.fundingList.create({
      data: {
        name,
        description,
        monthlyBudget: parseFloat(monthlyBudget),
        userId,
        // Only create project associations if projects are provided
        ...(projects.length > 0 && {
          projects: {
            create: projects.map((project: any) => ({
              projectId: project.id,
              distributionPercentage: project.distributionPercentage || 0,
            })),
          },
        }),
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    return NextResponse.json(fundingList);
  } catch (error) {
    console.error("Error creating funding list:", error);
    return NextResponse.json(
      { error: "Failed to create funding list" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, monthlyBudget, projects } = body;

    // Update the funding list
    const fundingList = await prisma.fundingList.update({
      where: { id },
      data: {
        name,
        description,
        monthlyBudget: parseFloat(monthlyBudget),
        projects: {
          deleteMany: {},
          create: projects.map((project: any) => ({
            projectId: project.id,
            distributionPercentage: project.distributionPercentage,
          })),
        },
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    return NextResponse.json(fundingList);
  } catch (error) {
    console.error("Error updating funding list:", error);
    return NextResponse.json(
      { error: "Failed to update funding list" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Funding list ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.fundingList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting funding list:", error);
    return NextResponse.json(
      { error: "Failed to delete funding list" },
      { status: 500 }
    );
  }
} 