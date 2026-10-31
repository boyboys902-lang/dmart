import { createContext } from "react";
import { shoppingData } from "../data";

export const ProductsContext = createContext({
  products: shoppingData,
  loading: true,
  usingFallback: true,
  error: null,
  refresh: async () => {},
});
