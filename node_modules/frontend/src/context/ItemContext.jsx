/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { apiRequest } from "../utils/api.js";

const ItemContext = createContext(null);

export function ItemProvider({ children }) {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  const handleRequestError = useCallback(
    (error) => {
      if (error.status === 401) {
        logout();
      }

      setItemsError(error.message || "Request failed.");
    },
    [logout]
  );

  const fetchItems = useCallback(
    async (search = "") => {
      if (!token) {
        setItems([]);
        return [];
      }

      setItemsLoading(true);
      setItemsError("");

      try {
        const query = search
          ? `/items?search=${encodeURIComponent(search)}`
          : "/items";
        const data = await apiRequest(query, { token });
        setItems(data);
        return data;
      } catch (error) {
        handleRequestError(error);
        return [];
      } finally {
        setItemsLoading(false);
      }
    },
    [handleRequestError, token]
  );

  const addItem = useCallback(
    async (formData) => {
      try {
        setItemsError("");
        const data = await apiRequest("/items", {
          method: "POST",
          body: formData,
          token,
        });
        setItems((currentItems) => [data.item, ...currentItems]);
        return data.item;
      } catch (error) {
        handleRequestError(error);
        throw error;
      }
    },
    [handleRequestError, token]
  );

  const updateItem = useCallback(
    async (itemId, formData) => {
      try {
        setItemsError("");
        const data = await apiRequest(`/items/${itemId}`, {
          method: "PUT",
          body: formData,
          token,
        });

        setItems((currentItems) =>
          currentItems.map((item) => (item._id === itemId ? data.item : item))
        );

        return data.item;
      } catch (error) {
        handleRequestError(error);
        throw error;
      }
    },
    [handleRequestError, token]
  );

  const deleteItem = useCallback(
    async (itemId) => {
      try {
        setItemsError("");
        await apiRequest(`/items/${itemId}`, {
          method: "DELETE",
          token,
        });

        setItems((currentItems) =>
          currentItems.filter((item) => item._id !== itemId)
        );
      } catch (error) {
        handleRequestError(error);
        throw error;
      }
    },
    [handleRequestError, token]
  );

  useEffect(() => {
    if (!token) {
      setItems([]);
      setItemsError("");
      setItemsLoading(false);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      items,
      itemsLoading,
      itemsError,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
    }),
    [items, itemsLoading, itemsError, fetchItems, addItem, updateItem, deleteItem]
  );

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
}

export function useItems() {
  const context = useContext(ItemContext);

  if (!context) {
    throw new Error("useItems must be used inside ItemProvider.");
  }

  return context;
}
