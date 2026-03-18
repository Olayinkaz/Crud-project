import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemContext.jsx";

function DashboardLayout() {
  const { logout, user } = useAuth();
  const { items } = useItems();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <p className="eyebrow">Workspace</p>
          <h1>Items Hub</h1>
          <p className="muted-text">
            Manage your collection with secure CRUD actions and quick search.
          </p>
        </div>

        <nav className="sidebar-nav">
          <NavLink className="sidebar-link" end onClick={closeSidebar} to="/">
            <span className="sidebar-link-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            Dashboard
          </NavLink>
          <NavLink className="sidebar-link" onClick={closeSidebar} to="/add">
            <span className="sidebar-link-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Add Item
          </NavLink>
        </nav>

        <div className="sidebar-card">
          <p className="sidebar-label">Overview</p>
          <strong>{items.length} items</strong>
          <p className="muted-text">Create, edit, and remove records from here.</p>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          aria-label="Close navigation menu"
          className="sidebar-backdrop"
          onClick={closeSidebar}
          type="button"
        />
      )}

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-copy">
            <button
              aria-expanded={isSidebarOpen}
              aria-label="Toggle navigation menu"
              className={`mobile-menu-button ${isSidebarOpen ? "is-open" : ""}`}
              onClick={() => setIsSidebarOpen((currentValue) => !currentValue)}
              type="button"
            >
              <span className="mobile-menu-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
            <p className="eyebrow">Dashboard Header</p>
            <h2>Welcome back, {user?.name}</h2>
            <p className="muted-text">
              Use the sidebar for navigation and manage your account from this
              header.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-user-card">
              <p className="sidebar-label">Signed in as</p>
              <strong>{user?.name}</strong>
              <p className="muted-text">{user?.email}</p>
            </div>

            <button
              className="button button-secondary header-logout-button"
              onClick={() => {
                closeSidebar();
                logout();
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default DashboardLayout;
