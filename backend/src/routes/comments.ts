import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const comments = await prisma.comment.findMany();
  res.json(comments);
});

router.get('/:id', async (req, res) => {
  const comment = await prisma.comment.findUnique({
    where: { id: req.params.id },
  });
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  res.json(comment);
});

router.post('/', authenticate, async (req, res) => {
  const { postId, content } = req.body;
  if (!postId || !content) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId: req.user.userId,
        content,
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { content } = req.body;
  const commentId = req.params.id;

  if (!content) {
    res.status(400).json({ error: 'Missing content' });
    return;
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (
      !req.user ||
      (comment.authorId !== req.user.userId && req.user.role !== 'author')
    ) {
      res.status(403).json({ error: 'You can only edit your own comments' });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const commentId = req.params.id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (
      !req.user ||
      (comment.authorId !== req.user.userId && req.user.role !== 'author')
    ) {
      res.status(403).json({ error: 'You can only delete your own comments' });
      return;
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });
    res
      .status(200)
      .json({ message: 'Comment deleted', comment: deletedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
