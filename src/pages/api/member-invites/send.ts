import type { NextApiResponse } from 'next';

import { type NextApiRequestWithUser, withAuth } from '@/features/auth';
import {
  InviteMemberTemplate,
  kashEmail,
  replyToEmail,
  resend,
} from '@/features/emails';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { safeStringify } from '@/utils/safeStringify';
import { getURL } from '@/utils/validUrl';

async function sendInvites(req: NextApiRequestWithUser, res: NextApiResponse) {
  const userId = req.userId;

  logger.debug(`Request body: ${safeStringify(req.body)}`);
  logger.debug(`User ID: ${userId}`);

  const { email, memberType } = req.body;

  if (!email || !memberType) {
    logger.warn('Email and member type are required');
    return res
      .status(400)
      .json({ error: 'Email and member type are required.' });
  }

  try {
    logger.debug(`Fetching user details for user ID: ${userId}`);
    const user = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentSponsor: {
          select: {
            id: true,
            name: true,
          },
        },
        UserSponsors: true,
      },
    });

    if (!user || !user.currentSponsor) {
      logger.warn(`Unauthorized access attempt by user ID: ${userId}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    logger.debug(`Creating user invite for email: ${email}`);
    const result = await prisma.userInvites.create({
      data: {
        email,
        senderId: userId as string,
        sponsorId: user.currentSponsor.id,
        memberType,
      },
    });

    logger.debug(`Sending invite email to: ${email}`);
    await resend.emails.send({
      from: kashEmail,
      to: [email],
      subject: `${user.firstName} has invited you to join ${user.currentSponsor.name}'s profile on Superteam Earn`,
      react: InviteMemberTemplate({
        sponsorName: user.currentSponsor.name,
        senderName: `${user.firstName} ${user.lastName}`,
        link: `${getURL()}signup?invite=${result.id}`,
      }),
      reply_to: replyToEmail,
    });

    logger.info(`Invite sent successfully to ${email} by user ${userId}`);
    return res.status(200).json({ message: 'Invite sent successfully.' });
  } catch (error: any) {
    logger.error(
      `User ${userId} unable to send invite: ${safeStringify(error)}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while sending the invite.',
    });
  }
}

export default withAuth(sendInvites);
