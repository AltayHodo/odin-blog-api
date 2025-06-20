import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import styles from '../styles/PostPage.module.css';

interface PostType {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/posts/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setPost(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to load post'
        );
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading post...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.errorContainer}>
        <p>Post not found</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.postPageContainer}>
      <Post
        id={post.id}
        title={post.title}
        content={post.content}
        authorId={post.authorId}
        authorName={post.authorName}
        createdAt={post.createdAt}
        showFullContent={true}
      />

      <button onClick={() => navigate('/')} className={styles.backButton}>
        ← Back to Posts
      </button>
    </div>
  );
}

export default PostPage;
