import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, trancheAmount, txId = '', note = '' } = req.query;
  const parsedTrancheAmount = parseInt(trancheAmount as string, 10);

  logger.debug(`Request query: ${safeStringify(req.query)}`);

  if (!id || !trancheAmount) {
    logger.warn('Missing required query parameters: id or trancheAmount');
    return res.status(400).json({
      error: 'Missing required query parameters: id or trancheAmount',
    });
  }

  try {
    logger.info(`Fetching grant application with ID: ${id}`);
    const currentApplication = await prisma.grantApplication.findUnique({
      where: { id: id as string },
      include: { grant: true },
    });

    if (!currentApplication) {
      logger.info(`Grant application not found with ID: ${id}`);
      return res.status(404).json({ error: 'Grant application not found' });
    }

    let updatedPaymentDetails = currentApplication.paymentDetails || [];
    if (!Array.isArray(updatedPaymentDetails)) {
      updatedPaymentDetails = [];
    }

    updatedPaymentDetails.push({
      txId: txId || null,
      note: note || null,
      tranche: currentApplication.totalTranches + 1,
      amount: parsedTrancheAmount,
    });

    logger.info('Updating payment details and grant information');
    const result = await prisma.$transaction(async (tx) => {
      const updatedGrantApplication = await tx.grantApplication.update({
        where: { id: id as string },
        data: {
          totalPaid: {
            increment: parsedTrancheAmount,
          },
          totalTranches: {
            increment: 1,
          },
          paymentDetails: updatedPaymentDetails as any,
        },
      });

      await tx.grants.update({
        where: {
          id: currentApplication.grantId,
        },
        data: {
          totalPaid: {
            increment: parsedTrancheAmount,
          },
        },
      });

      return updatedGrantApplication;
    });

    logger.info(
      `Payment details updated successfully for grant application ID: ${id}`,
    );
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Error occurred while updating payment for grant application ID: ${id}`,
      safeStringify(error),
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while updating payment of a submission ${id}.`,
    });
  }
}
