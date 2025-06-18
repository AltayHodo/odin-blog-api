import { useParams } from "react-router-dom";

function PostPage() {
  const { id } = useParams();
  return (
    <div>
      <h1>Post Page</h1>
      <p>This is the post page content.</p>
    </div>
  );
}

export default PostPage;