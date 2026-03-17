import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AddItemPage from "./pages/AddItemPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      {!isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "page-shell" : "container page-content"}>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add" element={<AddItemPage />} />
          </Route>
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
