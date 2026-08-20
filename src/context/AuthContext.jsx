// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";
import { validCredentials } from "../data/authData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    if (
      email.trim().toLowerCase() === validCredentials.email &&
      password === validCredentials.password
    ) {
      setIsAuthenticated(true);
      setCurrentUser(validCredentials.user);
      return { success: true };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);