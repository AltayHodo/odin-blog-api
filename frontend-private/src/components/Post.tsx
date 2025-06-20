import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';
import Comment from './Comment';
import styles from '../styles/Post.module.css';

interface PostProps {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  showFullContent?: boolean;
  onDelete?: (id: string) => void;
}

const Post = ({
  id,
  title,
  content,
  authorId,
  authorName,
  createdAt,
  showFullContent = false,
  onDelete,
}: PostProps) => {
  interface CommentType {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
  }

  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch comments for this specific post
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/posts/${id}/comments`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
    // whenever post id changes?
  }, [id]);

  const handleCommentSubmit = async (content: string) => {
    if (!user) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }),
      });

      const newComment = await response.json();
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePostDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      if (onDelete) {
        onDelete(id);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Truncate content for preview if not showing full content
  const displayContent = showFullContent
    ? content
    : content.length > 200
    ? `${content.substring(0, 200)}...`
    : content;

  return (
    <div className={styles.post}>
      <div className={styles.postHeader}>
        <h2 className={styles.postTitle}>{title}</h2>
        {user && user.role === 'author' && (
          <button
            onClick={handlePostDelete}
            disabled={isDeleting}
            className={styles.deleteButton}
            aria-label="Delete post"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
      <div className={styles.postMeta}>
        <span>By {authorName}</span>
        <span>Posted on {formattedDate}</span>
      </div>

      <div className={styles.postContent}>{displayContent}</div>

      {!showFullContent && (
        <Link to={`/post/${id}`} className={styles.readMoreLink}>
          Read more
        </Link>
      )}

      {showFullContent && (
        <div className={styles.commentsSection}>
          <h3>Comments ({comments.length})</h3>

          {loading ? (
            <p>Loading comments...</p>
          ) : (
            <>
              {comments.length > 0 ? (
                <div className={styles.commentsList}>
                  {comments.map((comment) => (
                    <Comment key={comment.id} {...comment} postId={id} onDelete={handleCommentDelete} />
                  ))}
                </div>
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}

              {user ? (
                <CommentForm onSubmit={handleCommentSubmit} />
              ) : (
                <p className={styles.loginPrompt}>
                  <Link to="/login">Sign in</Link> to leave a comment.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
