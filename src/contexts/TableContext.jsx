import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const TableContext = createContext();

const API_BASE = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";

export const TableProvider = ({ children }) => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/table`
      );
      setTables(response.data);
    } catch (error) {
      console.log("Error while fetching the tables");
    }
  };

  const createTable = async (formData) => {
    try {
      const res = await axios.post(
        `${API_BASE}/table`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTables((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error creating table:", error);
      throw error;
    }
  };

  const updateTable = async (id, formData) => {
    try {
      const res = await axios.put(
        `${API_BASE}/table/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTables((prev) =>
        prev.map((table) => (table.id === id ? res.data : table))
      );
      return res.data;
    } catch (error) {
      console.error("Error updating table:", error);
      throw error;
    }
  };

  const deleteTable = async (id) => {
    try {
      await axios.delete(`${API_BASE}/table/${id}`);
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (error) {
      console.error("Error deleting table:", error);
      throw error;
    }
  };
  const updateTableStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `${API_BASE}/table/${id}/status`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      );
      await fetchTables();
      console.log(`Updated table ${id} status to:`, status);
      return res.data;
    } catch (error) {
      console.error("Error updating the table status", error);
      throw error;
    }
  };
  return (
    <TableContext.Provider
      value={{
        tables,
        setTables,
        fetchTables,
        createTable,
        updateTable,
        deleteTable,
        updateTableStatus,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};
