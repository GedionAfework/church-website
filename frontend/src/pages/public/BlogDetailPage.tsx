import { useParams } from 'react-router-dom';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams();

  return (
    <div className="blog-detail-page">
      <h1>Blog Post: {slug}</h1>
      <p>Blog detail - Coming soon</p>
    </div>
  );
};

export default BlogDetailPage;

