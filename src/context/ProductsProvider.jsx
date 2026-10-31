import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "../utils/firestoreApi";
import { shoppingData } from "../data";
import { ProductsContext } from "./productsContext";

const onlyActive = (products) => products.filter((product) => product.active !== false);

const ProductsProvider = ({ children }) => {
  // The bundled catalogue is shown immediately; Firestore replaces it as soon
  // as the live products load.
  const [products, setProducts] = useState(shoppingData);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const live = onlyActive(await getProducts());

      if (live.length > 0) {
        setProducts(live);
        setUsingFallback(false);
        setError(null);
      } else {
        // Nothing in Firestore yet — keep the site usable with the bundled
        // catalogue until the admin adds products.
        setProducts(shoppingData);
        setUsingFallback(true);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts(shoppingData);
      setUsingFallback(true);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ products, loading, usingFallback, error, refresh }),
    [products, loading, usingFallback, error, refresh]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export default ProductsProvider;
