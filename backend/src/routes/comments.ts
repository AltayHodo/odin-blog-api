import { Router } from 'express';
import { prisma } from '../lib/prisma';

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

router.post('/', async (req, res) => {
  const { postId, authorId, content } = req.body;
  if (!postId || !authorId || !content) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
  }
});

router.put('/:id', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Missing content' });
    return;
  }

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { content },
    });
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Comment not found or update failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedComment = await prisma.comment.delete({
      where: { id: req.params.id },
    });
    res
      .status(200)
      .json({ message: 'Comment deleted', comment: deletedComment });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Comment not found or delete failed' });
  }
});

export default router;
