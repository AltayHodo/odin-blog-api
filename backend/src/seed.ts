import { prisma } from './lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const SALT_ROUNDS = 10;

  const author = await prisma.user.create({
    data: {
      username: 'altayhodo (author)',
      email: 'altay.hodo@gmail.com',
      passwordHash: await bcrypt.hash('password', SALT_ROUNDS),
      role: 'author',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@gmail.com',
      passwordHash: await bcrypt.hash('password', SALT_ROUNDS),
      role: 'viewer',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      email: 'user2@gmail.com',
      passwordHash: await bcrypt.hash('password', SALT_ROUNDS),
      role: 'viewer',
    },
  });

  const post1 = await prisma.post.create({
    data: {
      title: 'My First Post',
      content: 'Hello world, this is my first blog post!',
      published: true,
      authorId: author.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Behind the Scenes (not published yet)',
      content: 'A glimpse into how I write my posts...',
      published: false,
      authorId: author.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Another post',
      content: 'this is the content of the post',
      published: true,
      authorId: author.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        authorId: user1.id,
        content: 'wow what a great post!',
      },
      {
        postId: post1.id,
        authorId: user2.id,
        content: 'excited to read more!',
      },
      {
        postId: post3.id,
        authorId: user1.id,
        content: 'this is my comment',
      },
    ],
  });

  console.log({ author, user1, user2, post1, post2 });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
