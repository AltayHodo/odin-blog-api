import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router()
const posts = ['post 1', 'post 2']

router.get('/', (req, res) => {
  // fetch posts with prisma
  res.json(posts)
})

// add other crud actions

export default router;
