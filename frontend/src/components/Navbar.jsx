import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink className="brand" to={isAuthenticated ? "/" : "/auth"}>
          FullStack Eval App
        </NavLink>

        {isAuthenticated ? (
          <nav className="nav-links">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/add">Add Item</NavLink>
          </nav>
        ) : (
          <nav className="nav-links">
            <NavLink to="/auth">Login / Register</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
