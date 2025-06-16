import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
  });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(post);
});

router.post('/', async (req, res) => {
  const { title, content, authorId, published = false } = req.body;

  if (!title || !content || !authorId) {
    res
      .status(400)
      .json({ error: 'Missing required fields' });
    return;
  }
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        published,
      },
    });
    res.json(newPost);
  } catch (error) {
    console.error(error);
  }
});

router.put('/:id', async (req, res) => {
  const { title, content, authorId, published = false } = req.body;

  if (!title || !content || !authorId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        authorId,
        published,
      },
    });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.json({ error: 'Post not found or update failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await prisma.post.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: 'Post deleted', post: deletedPost });
  } catch (error) {
    console.error(error);
  }
});

export default router;
