import styles from '../styles/Comment.module.css';

interface CommentProps {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

const Comment = ({ content, authorName, createdAt }: CommentProps) => {
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <span className={styles.commentAuthor}>{authorName}</span>
        <span className={styles.commentDate}>{formattedDate}</span>
      </div>
      <div className={styles.commentContent}>{content}</div>
    </div>
  );
};

export default Comment;
