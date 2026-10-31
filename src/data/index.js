import products from "./products.json";

// The catalogue that ships with the site. The storefront reads live products
// from Firestore (managed in Admin → Products); this list is only used as a
// fallback when Firestore has no products yet (and as the starter catalogue
// that can be imported from the admin panel).
export const shoppingData = products;

export default shoppingData;
