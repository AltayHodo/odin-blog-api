import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();
const posts = ['post 1', 'post 2'];

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
  res.json(post);
});

// add other crud actions

export default router;
