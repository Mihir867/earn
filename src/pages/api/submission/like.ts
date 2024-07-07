import type { NextApiResponse } from 'next';

import { type NextApiRequestWithUser, withAuth } from '@/features/auth';
import { sendEmailNotification } from '@/features/emails';
import logger from '@/lib/logger';
import { updateLike } from '@/services/likeService';

async function submission(req: NextApiRequestWithUser, res: NextApiResponse) {
  try {
    const userId = req.userId;
    const { id }: { id: string } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'Submission ID is required.',
      });
    }

    const updatedSubmission = await updateLike('submission', id, userId!);

    if (
      Array.isArray(updatedSubmission?.like) &&
      updatedSubmission.like.length > 0
    ) {
      await sendEmailNotification({
        type: 'submissionLike',
        id,
        userId: updatedSubmission?.userId,
        triggeredBy: userId,
      });
    }

    return res.status(200).json(updatedSubmission);
  } catch (error: any) {
    logger.error(
      `Error updating submission like for user=${req.userId}: ${error.message}`,
    );
    return res.status(500).json({
      error: error.message,
      message: 'Error occurred while updating submission like.',
    });
  }
}

export default withAuth(submission);
