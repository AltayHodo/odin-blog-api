import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { hash } from 'crypto';

const router = Router();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

router.post('/', async (req, res) => {
  const { username, email, passwordHash, role = 'viewer' } = req.body;
  if (!username || !email || !passwordHash) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(passwordHash, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
  }
});

router.put('/:id', async (req, res) => {
  const { username, email, passwordHash } = req.body;
  if (!username || !email || !passwordHash) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateData: any = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (passwordHash) {
      updateData.passwordHash = await bcrypt.hash(passwordHash, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: 'User deleted', user: deletedUser });
  } catch (error) {
    console.error(error);
  }
});

export default router;
