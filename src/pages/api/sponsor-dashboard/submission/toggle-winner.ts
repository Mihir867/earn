import type { NextApiResponse } from 'next';

import { type NextApiRequestWithUser, withAuth } from '@/features/auth';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { fetchTokenUSDValue } from '@/utils/fetchTokenUSDValue';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const userId = req.userId;

  logger.debug(`Request body: ${JSON.stringify(req.body)}`);
  const { id, isWinner, winnerPosition, ask } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
    });

    if (!user) {
      logger.warn(`User with ID ${userId} not found or unauthorized`);
      return res.status(400).json({ error: 'Unauthorized' });
    }

    logger.debug(`Fetching submission with ID: ${id}`);
    const currentSubmission = await prisma.submission.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!currentSubmission) {
      logger.warn(`Submission with ID ${id} not found`);
      return res.status(404).json({
        message: `Submission with ID ${id} not found.`,
      });
    }

    if (user.currentSponsorId !== currentSubmission.listing.sponsorId) {
      logger.warn(`User ${userId} unauthorized to update submission ${id}`);
      return res.status(403).json({
        message: 'Unauthorized',
      });
    }

    logger.debug(`Updating submission with ID: ${id}`);
    const result = await prisma.submission.update({
      where: { id },
      data: { isWinner, winnerPosition },
      include: { listing: true },
    });

    if (currentSubmission.isWinner !== isWinner) {
      const bountyId = result.listingId;
      const totalWinnersUpdate = {
        totalWinnersSelected: isWinner ? { increment: 1 } : { decrement: 1 },
      };

      logger.debug(`Updating bounty total winners for listing ID: ${bountyId}`);

      const listing = result.listing;

      if (listing.compensationType !== 'fixed') {
        logger.debug('Fetching token USD value for variable compensation');
        const tokenUSDValue = await fetchTokenUSDValue(
          listing.token!,
          listing.publishedAt!,
        );
        const usdValue = tokenUSDValue * ask;

        await prisma.bounties.update({
          where: { id: bountyId },
          data: {
            ...totalWinnersUpdate,
            rewards: { first: ask },
            rewardAmount: ask,
            usdValue,
          },
        });
      } else {
        await prisma.bounties.update({
          where: { id: bountyId },
          data: totalWinnersUpdate,
        });
      }
    }

    logger.info(`Successfully updated submission with ID: ${id}`);
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(`User ${userId} unable to toggle winners: ${error.message}`);
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while updating submission ${id}.`,
    });
  }
}

export default withAuth(handler);
