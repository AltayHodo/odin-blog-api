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

// make .post route to create a post, authorize
router.post('/', authenticate, authorize(['author']), async (req, res) => {
  const { title, content } = req.body;
  if (!content || !title) {
    res.status(400).json({ error: 'Missing Fields' });
    return
  }

  try {
    const authorId = req.user?.userId;
    if (!authorId) {
      res.status(400).json({ error: 'Author ID is required' });
      return;
    }
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    const formattedPost = {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId,
      authorName: newPost.author?.username,
      createdAt: newPost.createdAt,
      published: newPost.published,
    }

    res.status(201).json(formattedPost)
  } catch (error) {
    console.error('Error creating post', error)
    res.status(500).json({ error: 'Failed to create post'})
  }
});

router.post('/:id/comments', authenticate, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user.userId,
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      authorId: newComment.authorId,
      authorName: newComment.author?.username || 'Unknown User',
      postId: newComment.postId,
      createdAt: newComment.createdAt,
    };
    res.status(201).json(formattedComment);
  } catch (error) {
    res.status(500).json({ error: 'error' });
    return;
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
