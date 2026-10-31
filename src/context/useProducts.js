import { useContext } from "react";
import { ProductsContext } from "./productsContext";

export const useProducts = () => useContext(ProductsContext);

export const useProduct = (id) => {
  const { products } = useProducts();
  return products.find((product) => Number(product.id) === Number(id));
};
