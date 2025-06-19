import { useState, useEffect } from 'react';
import Post from '../components/Post';
import styles from '../styles/HomePage.module.css';

interface PostType {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/posts`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.homePage}>
      <h1 className={styles.pageTitle}>Latest Posts</h1>

      {posts.length === 0 ? (
        <p className={styles.noPosts}>No posts available at the moment.</p>
      ) : (
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              authorId={post.authorId}
              authorName={post.authorName}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
