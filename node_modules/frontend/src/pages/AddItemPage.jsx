import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "../context/ItemContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const initialFormState = {
  name: "",
  description: "",
};

function AddItemPage() {
  const navigate = useNavigate();
  const { addItem } = useItems();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  function validate() {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    }

    return errors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validate();
    setFormErrors(errors);
    setRequestError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await addItem(formData);
      addToast({
        title: "Item created",
        message: "Your new item has been added to the dashboard.",
        type: "success",
      });
      setFormData(initialFormState);
      navigate("/");
    } catch (error) {
      const message = error.message || "Failed to create item.";
      setRequestError(message);
      addToast({
        title: "Could not create item",
        message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">New Item</p>
          <h1>Add an item</h1>
          <p className="muted-text">
            Submit a new entry to the secured MongoDB collection.
          </p>
        </div>
      </div>

      <form className="card form-grid" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="name">
            Name
          </label>
          <input
            className="field-input"
            id="name"
            name="name"
            onChange={handleChange}
            placeholder="Item name"
            value={formData.name}
          />
          {formErrors.name && <p className="error-text">{formErrors.name}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            className="field-input field-textarea"
            id="description"
            name="description"
            onChange={handleChange}
            placeholder="Describe the item"
            rows="5"
            value={formData.description}
          />
          {formErrors.description && (
            <p className="error-text">{formErrors.description}</p>
          )}
        </div>

        {requestError && <p className="error-text">{requestError}</p>}

        <div className="button-row">
          <button className="button button-secondary" onClick={() => navigate("/")} type="button">
            Cancel
          </button>
          <button className="button" disabled={submitting} type="submit">
            {submitting ? "Saving..." : "Save Item"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddItemPage;
