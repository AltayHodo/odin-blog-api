import { useState } from 'react';
import styles from '../styles/CommentForm.module.css';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent(''); // Clear form after successful submission
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.commentForm} onSubmit={handleSubmit}>
      <h4>Add a Comment</h4>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
        className={styles.commentTextarea}
        disabled={isSubmitting}
        required
      />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
