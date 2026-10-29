import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="publicLayout">
      <header className="publicHeader">
        <span className="logo">Service Desk</span>
      </header>

      <main className="publicMain">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
