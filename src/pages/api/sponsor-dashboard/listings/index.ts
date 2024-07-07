import { GrantStatus, status } from '@prisma/client';
import type { NextApiResponse } from 'next';

import { type NextApiRequestWithUser, withAuth } from '@/features/auth';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';

type BountyGrant = {
  type: 'bounty' | 'grant';
  id: string;
  title: string;
  slug: string;
  token: string | null;
  status: string;
  deadline: Date | null;
  isPublished: boolean;
  rewards: any;
  rewardAmount: number | null;
  totalWinnersSelected: number | null;
  totalPaymentsMade: number;
  isWinnersAnnounced: boolean | null;
  applicationType: string | null;
  maxRewardAsk: number | null;
  minRewardAsk: number | null;
  compensationType: string | null;
  createdAt: Date;
};

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
    });

    if (!user || !user.currentSponsorId) {
      logger.warn(`User ${userId} does not have a current sponsor`);
      return res
        .status(403)
        .json({ error: 'User does not have a current sponsor.' });
    }

    const params = req.query;
    const sponsorId = user.currentSponsorId;
    const searchText = params.searchText as string;
    const whereSearch = searchText ? `AND title LIKE '%${searchText}%'` : '';

    const data: BountyGrant[] = await prisma.$queryRawUnsafe(
      `
      SELECT 
        b.type as type,
        b.id,
        b.title,
        b.slug,
        b.token,
        b.status,
        b.deadline,
        b.isPublished,
        b.rewards,
        b.rewardAmount,
        b.totalWinnersSelected,
        b.totalPaymentsMade,
        b.isWinnersAnnounced,
        b.applicationType,
        b.maxRewardAsk,
        b.minRewardAsk,
        b.compensationType,
        b.createdAt
      FROM Bounties b
      WHERE b.isActive = true
      AND b.isArchived = false
      AND b.sponsorId = ?
      AND b.status = ?
      ${whereSearch}
      
      UNION ALL
      
      SELECT 
        'grant' as type,
        g.id,
        g.title,
        g.slug,
        g.token,
        g.status,
        NULL as deadline,
        g.isPublished,
        NULL as rewards,
        NULL as rewardAmount,
        NULL as totalWinnersSelected,
        g.totalPaid as totalPaymentsMade,
        NULL as isWinnersAnnounced,
        NULL as applicationType,
        g.maxReward as maxRewardAsk,
        g.minReward as minRewardAsk,
        NULL as compensationType,
        g.createdAt
      FROM Grants g
      WHERE g.isActive = true
      AND g.isArchived = false
      AND g.sponsorId = ?
      AND g.status = ?
      ${whereSearch}
      
      ORDER BY createdAt DESC
    `,
      sponsorId,
      status.OPEN,
      sponsorId,
      GrantStatus.OPEN,
    );

    logger.info(`Successfully fetched bounties and grants for user ${userId}`);
    res.status(200).json(data);
  } catch (err: any) {
    logger.error(
      `Error fetching bounties and grants for user ${userId}: ${err.message}`,
    );
    res
      .status(400)
      .json({ err: 'Error occurred while fetching bounties and grants.' });
  }
}

export default withAuth(handler);
