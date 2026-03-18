import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const emptyEditState = {
  itemId: "",
  name: "",
  description: "",
};

function DashboardPage() {
  const { user } = useAuth();
  const { items, itemsError, itemsLoading, fetchItems, updateItem, deleteItem } =
    useItems();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(emptyEditState);
  const [editErrors, setEditErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deletingItemId, setDeletingItemId] = useState("");

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      fetchItems(search);
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [fetchItems, search]);

  function validateEditForm() {
    const errors = {};

    if (!editingItem.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!editingItem.description.trim()) {
      errors.description = "Description is required.";
    }

    return errors;
  }

  function openEditModal(item) {
    setActionError("");
    setEditErrors({});
    setEditingItem({
      itemId: item._id,
      name: item.name,
      description: item.description,
    });
  }

  function closeEditModal() {
    setEditErrors({});
    setActionError("");
    setEditingItem(emptyEditState);
  }

  function handleEditFieldChange(event) {
    const { name, value } = event.target;

    setEditingItem((currentItem) => ({
      ...currentItem,
      [name]: value,
    }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    const validationErrors = validateEditForm();
    setEditErrors(validationErrors);
    setActionError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setEditSubmitting(true);
      await updateItem(editingItem.itemId, {
        name: editingItem.name,
        description: editingItem.description,
      });
      addToast({
        title: "Item updated",
        message: "Your changes were saved successfully.",
        type: "success",
      });
      closeEditModal();
    } catch (error) {
      const message = error.message || "Failed to update item.";
      setActionError(message);
      addToast({
        title: "Could not update item",
        message,
        type: "error",
      });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(itemId) {
    const hasConfirmed = window.confirm(
      "Delete this item permanently from your collection?"
    );

    if (!hasConfirmed) {
      return;
    }

    try {
      setActionError("");
      setDeletingItemId(itemId);
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      await deleteItem(itemId);
      addToast({
        title: "Item deleted",
        message: "The item was removed from your collection.",
        type: "success",
      });
    } catch (error) {
      const message = error.message || "Failed to delete item.";
      setActionError(message);
      addToast({
        title: "Could not delete item",
        message,
        type: "error",
      });
    } finally {
      setDeletingItemId("");
    }
  }

  return (
    <section className="section-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your Items</h1>
          <p className="muted-text">
            Welcome back, {user?.name}. Search through the items stored in your
            collection.
          </p>
        </div>
      </div>

      {actionError && <p className="error-text">{actionError}</p>}

      <div className="card search-card">
        <div className="search-row">
          <div className="search-field">
            <label className="field-label" htmlFor="search">
              Search items
            </label>
            <input
              className="field-input"
              id="search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or description"
              value={search}
            />
          </div>
          <button className="button button-secondary" onClick={() => fetchItems(search)} type="button">
            Refresh
          </button>
        </div>
      </div>

      {itemsLoading && <p className="status-message">Loading items...</p>}
      {itemsError && <p className="error-text">{itemsError}</p>}

      {!itemsLoading && !itemsError && items.length === 0 && (
        <div className="card empty-state">
          <h2>No items yet</h2>
          <p className="muted-text">
            Add your first item from the form page to populate the dashboard.
          </p>
        </div>
      )}

      <div className="item-grid">
        {items.map((item, index) => (
          <article
            className={`card item-card ${deletingItemId === item._id ? "is-deleting" : ""}`}
            key={item._id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="item-card-top">
              <h2>{item.name}</h2>
              <span className="item-badge">Item</span>
            </div>
            <p className="item-description">{item.description}</p>
            <p className="timestamp">
              Created {new Date(item.createdAt).toLocaleString()}
            </p>
            <div className="item-actions">
              <button
                className="button button-secondary action-button"
                onClick={() => openEditModal(item)}
                type="button"
              >
                Edit
              </button>
              <button
                className="button button-danger action-button"
                disabled={deletingItemId === item._id}
                onClick={() => handleDelete(item._id)}
                type="button"
              >
                {deletingItemId === item._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {editingItem.itemId && (
        <div className="modal-backdrop" onClick={closeEditModal} role="presentation">
          <div
            className="card modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-item-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Edit Item</p>
                <h2 id="edit-item-title">Update this entry</h2>
              </div>
              <button
                className="button button-secondary action-button"
                onClick={closeEditModal}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={handleEditSubmit}>
              <div>
                <label className="field-label" htmlFor="edit-name">
                  Name
                </label>
                <input
                  className="field-input"
                  id="edit-name"
                  name="name"
                  onChange={handleEditFieldChange}
                  value={editingItem.name}
                />
                {editErrors.name && <p className="error-text">{editErrors.name}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  className="field-input field-textarea"
                  id="edit-description"
                  name="description"
                  onChange={handleEditFieldChange}
                  rows="5"
                  value={editingItem.description}
                />
                {editErrors.description && (
                  <p className="error-text">{editErrors.description}</p>
                )}
              </div>

              {actionError && <p className="error-text">{actionError}</p>}

              <div className="button-row">
                <button
                  className="button button-secondary"
                  onClick={closeEditModal}
                  type="button"
                >
                  Cancel
                </button>
                <button className="button" disabled={editSubmitting} type="submit">
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
