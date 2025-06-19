import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author?.username || 'Unknown Author',
      createdAt: post.createdAt,
      published: post.published,
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author?.username || 'Unknown Author',
      createdAt: post.createdAt,
      published: post.published,
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      authorName: comment.author?.username || 'Unknown User',
      postId: comment.postId,
      createdAt: comment.createdAt,
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments for post:', error);
    res.status(500).json({ error: 'Failed to fetch comments for post' });
  }
});

router.post('/', authenticate, authorize(['author']), async (req, res) => {
  const { title, content, authorId, published = false } = req.body;

  if (!title || !content || !authorId) {
    res.status(400).json({ error: 'Missing required fields' });
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

router.put('/:id', authenticate, authorize(['author']), async (req, res) => {
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

router.delete('/:id', authenticate, authorize(['author']), async (req, res) => {
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
