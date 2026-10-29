import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="centerMessage">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/requests">Go to requests</Link>
    </section>
  );
}

export default NotFoundPage;
