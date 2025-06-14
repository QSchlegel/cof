import { NextResponse } from 'next/server';
import type { FundingList } from '@/shared/types';

// Mock data for now
const mockFundingLists: FundingList[] = [
  {
    id: "1",
    name: "My First List",
    description: "A collection of my favorite projects",
    projects: [],
    totalFunded: "2,000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json([]);
  }

  // In a real app, we would filter by userId
  return NextResponse.json(mockFundingLists);
} 