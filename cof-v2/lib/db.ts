import { prisma } from './prisma'

// Project Operations
export async function getProjects(searchQuery?: string, platform?: string) {
  return prisma.project.findMany({
    where: {
      AND: [
        searchQuery ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        } : {},
        platform && platform !== 'all' ? { platform } : {},
      ],
    },
    include: {
      owner: true,
    },
    orderBy: {
      stars: 'desc',
    },
  })
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      fundingLists: true,
    },
  })
}

export async function createProject(data: {
  name: string
  description: string
  repositoryUrl: string
  platform: 'github' | 'gitlab'
  fundingAddress: string
  ownerId: string
}) {
  return prisma.project.create({
    data: {
      ...data,
      dependencies: [], // Will be populated by dependency extraction
    },
  })
}

// Funding List Operations
export async function getFundingLists(userId: string) {
  return prisma.fundingList.findMany({
    where: { ownerId: userId },
    include: {
      projects: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export async function createFundingList(data: {
  name: string
  description: string
  monthlyBudget: string
  ownerId: string
}) {
  return prisma.fundingList.create({
    data: {
      ...data,
      totalFunded: '0',
    },
  })
}

export async function addProjectToList(fundingListId: string, projectId: string) {
  return prisma.fundingList.update({
    where: { id: fundingListId },
    data: {
      projects: {
        connect: { id: projectId },
      },
    },
  })
}

// Transaction Operations
export async function getRecentTransactions(limit = 10) {
  return prisma.transaction.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      project: true,
      fundingList: true,
    },
  })
}

export async function createTransaction(data: {
  amount: string
  userId: string
  projectId: string
  fundingListId: string
}) {
  return prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        ...data,
        status: 'pending',
      },
    })

    // Update project's total funded amount
    await tx.project.update({
      where: { id: data.projectId },
      data: {
        totalFunded: {
          increment: data.amount,
        },
      },
    })

    // Update funding list's total funded amount
    await tx.fundingList.update({
      where: { id: data.fundingListId },
      data: {
        totalFunded: {
          increment: data.amount,
        },
      },
    })

    return transaction
  })
}

// User Operations
export async function getUserByAddress(address: string) {
  return prisma.user.findUnique({
    where: { address },
    include: {
      projects: true,
      fundingLists: true,
    },
  })
}

export async function createUser(data: {
  address: string
  name?: string
  avatar?: string
}) {
  return prisma.user.create({
    data,
  })
}

// Stats Operations
export async function getPlatformStats() {
  const [totalFunded, projectsSupported, activeDonors] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
    prisma.project.count(),
    prisma.user.count({
      where: {
        transactions: {
          some: {
            status: 'completed',
          },
        },
      },
    }),
  ])

  return {
    totalFunded: totalFunded._sum.amount || '0',
    projectsSupported,
    activeDonors,
  }
} 