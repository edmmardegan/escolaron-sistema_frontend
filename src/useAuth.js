import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx"; // O ponto indica que está na mesma pasta

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};