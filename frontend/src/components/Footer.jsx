import './Footer.css';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} DjEcommerce — MERN Edition</span>
        <span>Deployed on AWS EC2 · RDS PostgreSQL · S3 · Elastic Beanstalk</span>
      </div>
    </footer>
  );
}
