import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Comment.module.css';

interface CommentProps {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  postId: string;
  onDelete?: (id: string) => void;
}

const Comment = ({
  id,
  content,
  authorName,
  createdAt,
  onDelete,
}: CommentProps) => {
  const user = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://locahost:3001';
      const response = await fetch(`${apiUrl}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <span className={styles.commentAuthor}>{authorName}</span>
        <div className={styles.commentMeta}>
          <span className={styles.commentDate}>{formattedDate}</span>

          {/* Add delete button for authors */}
          {user && user.user && user.user.role === 'author' && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={styles.deleteButton}
              aria-label="Delete comment"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      <div className={styles.commentContent}>{content}</div>
    </div>
  );
};

export default Comment;
