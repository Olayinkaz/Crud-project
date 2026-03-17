import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const initialFormState = {
  name: "",
  email: "",
  password: "",
};

function AuthPage() {
  const { login, register, authError } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  function validate() {
    const nextErrors = {};

    if (mode === "register" && !formData.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    }

    return nextErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setFormData(initialFormState);
    setFormErrors({});
    setRequestError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    setRequestError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "login") {
        await login({
          email: formData.email,
          password: formData.password,
        });
        addToast({
          title: "Welcome back",
          message: "You have signed in successfully.",
          type: "success",
        });
      } else {
        await register(formData);
        addToast({
          title: "Account created",
          message: "Your profile is ready to use.",
          type: "success",
        });
      }
    } catch (error) {
      const message = error.message || "Authentication failed.";
      setRequestError(message);
      addToast({
        title: "Authentication failed",
        message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="hero-card">
        <p className="eyebrow">Evaluation Project</p>
        <h1>Full-stack items dashboard</h1>
        <p className="muted-text">
          Register or sign in to search, create, and manage items stored in MongoDB
          through a secured Express API.
        </p>
      </div>

      <div className="card auth-card">
        <div className="mode-switch">
          <button
            className={`tab-button ${mode === "login" ? "active" : ""}`}
            onClick={() => handleModeChange("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab-button ${mode === "register" ? "active" : ""}`}
            onClick={() => handleModeChange("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input
                className="field-input"
                id="name"
                name="name"
                onChange={handleChange}
                placeholder="Jane Doe"
                value={formData.name}
              />
              {formErrors.name && <p className="error-text">{formErrors.name}</p>}
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              className="field-input"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="jane@example.com"
              type="email"
              value={formData.email}
            />
            {formErrors.email && <p className="error-text">{formErrors.email}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              className="field-input"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="At least 6 characters"
              type="password"
              value={formData.password}
            />
            {formErrors.password && (
              <p className="error-text">{formErrors.password}</p>
            )}
          </div>

          {(requestError || authError) && (
            <p className="error-text">{requestError || authError}</p>
          )}

          <button className="button" disabled={submitting} type="submit">
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AuthPage;
