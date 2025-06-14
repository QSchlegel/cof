import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { repositoryUrl } = await request.json();

  if (!repositoryUrl) {
    return NextResponse.json(
      { error: "Repository URL is required" },
      { status: 400 }
    );
  }

  // Mock data for now
  const mockDependencies = [
    "react",
    "typescript",
    "@tanstack/react-query",
    "tailwindcss",
    "next"
  ];

  return NextResponse.json({ dependencies: mockDependencies });
} 