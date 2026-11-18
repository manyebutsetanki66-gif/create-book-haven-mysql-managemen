import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section-card center-message">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-add" to="/">Back to the dashboard</Link>
    </section>
  );
}
