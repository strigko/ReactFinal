import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function AppLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    showToast("You have logged out.", "success");
    navigate("/login");
  }

  return (
    <div className="appLayout">
      <header className="appHeader">
        <Link to="/requests" className="logo">
          Service Desk
        </Link>

        <nav>
          <NavLink to="/requests">Requests</NavLink>

          {user?.role === "user" && (
            <NavLink to="/requests/new">Create request</NavLink>
          )}
        </nav>

        <div className="headerUser">
          <span>{user?.name}</span>
          <button className="button secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="pageContent">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
