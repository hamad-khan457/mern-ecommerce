import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';
const Ctx = createContext();
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const fetchCart = async () => {
    try { const { data } = await API.get('/cart'); setCart(data); } catch { setCart(null); }
  };
  useEffect(() => { if (user) fetchCart(); else setCart(null); }, [user]);
  const addToCart       = async (slug) => { const { data } = await API.post(`/cart/add/${slug}`); setCart(data); };
  const removeFromCart  = async (slug) => { const { data } = await API.delete(`/cart/remove/${slug}`); setCart(data); };
  const removeSingle    = async (slug) => { const { data } = await API.patch(`/cart/remove-single/${slug}`); setCart(data); };
  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  return <Ctx.Provider value={{ cart, cartCount, addToCart, removeFromCart, removeSingle, fetchCart }}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
