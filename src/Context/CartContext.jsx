import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // ya aap fetch use karein
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get JWT token
  const token = localStorage.getItem('token');
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Load cart from DB on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5000/api/cart', authConfig)
      .then(res => setCartItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  // Add to cart (DB sync)
  const addToCart = async (product) => {
    const numericPrice = parseInt(product.price.replace(/[^\d]/g, '')) || 100;
    
    // Optimistic UI update
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        image: product.image,
        unit: '1 unit',
        basePrice: numericPrice,
        qty: 1,
      }];
    });

    // DB Sync
    try {
      const res = await axios.post('http://localhost:5000/api/cart/add', {
        productId: product.id,
        name: product.name,
        image: product.image,
        unit: '1 unit',
        basePrice: numericPrice,
      }, authConfig);
      setCartItems(res.data);
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  // Update qty
  const updateQty = async (productId, newQty) => {
    // Optimistic update
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: newQty } : i));
    }

    try {
      const res = await axios.put('http://localhost:5000/api/cart/update', 
        { productId, qty: newQty }, authConfig);
      setCartItems(res.data);
    } catch (err) {
      console.error('Failed to update qty', err);
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
    try {
      const res = await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, authConfig);
      setCartItems(res.data);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, updateQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);