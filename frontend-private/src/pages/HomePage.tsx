import { useState, useEffect } from 'react';
import Post from '../components/Post';
import CreatePostForm from '../components/CreatePostForm';
import { useAuth } from '../context/AuthContext';
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
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { user } = useAuth();

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

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostCreated = (newPost: PostType) => {
    setPosts([newPost, ...posts]);
    setIsCreatingPost(false);
  };

  const toggleCreateForm = () => {
    setIsCreatingPost(!isCreatingPost);
  };

  if (loading && posts.length === 0) {
    return <div className={styles.loadingContainer}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Author Dashboard</h1>
        <button className={styles.createButton} onClick={toggleCreateForm}>
          {isCreatingPost ? 'Cancel' : 'Create New Post'}
        </button>
      </div>

      {isCreatingPost && (
        <CreatePostForm
          onPostCreated={handlePostCreated}
          onCancel={() => setIsCreatingPost(false)}
        />
      )}

      {posts.length === 0 ? (
        <p className={styles.noPosts}>
          No posts available. Create your first post!
        </p>
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
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
