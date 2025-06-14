import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for now
  return NextResponse.json({
    totalFunded: "100,000",
    projectsSupported: 25,
    activeDonors: 150
  });
} 