import { NextResponse } from 'next/server';

// Mock data for now
const mockTransactions = [
  {
    id: "1",
    amount: "1,000",
    recipients: ["Project 1", "Project 2"],
    createdAt: new Date().toISOString(),
    status: "Completed"
  },
  {
    id: "2",
    amount: "500",
    recipients: ["Project 3"],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "Completed"
  }
];

export async function GET() {
  return NextResponse.json(mockTransactions);
} 