import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './ItemCard.css';

const CATEGORY_NAMES = { S: 'Shirt', SW: 'Sport wear', OW: 'Outwear' };

export default function ItemCard({ item }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      await addToCart(item.slug);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally { setAdding(false); }
  };

  return (
    <Link to={`/product/${item.slug}`} className="item-card">
      <div className="item-img-wrap">
        <img src={item.image || 'https://via.placeholder.com/400x280?text=No+Image'} alt={item.title} />
        <span className={`item-label badge label-${item.label}`}>
          {item.label === 'P' ? 'New' : item.label === 'S' ? 'Sale' : 'Hot'}
        </span>
      </div>
      <div className="item-body">
        <p className="item-category">{CATEGORY_NAMES[item.category] || item.category}</p>
        <h3 className="item-title">{item.title}</h3>
        <div className="item-footer">
          <div className="item-pricing">
            {item.discountPrice ? (
              <>
                <span className="price-discounted">${parseFloat(item.discountPrice).toFixed(2)}</span>
                <span className="price-original">${parseFloat(item.price).toFixed(2)}</span>
              </>
            ) : (
              <span className="price-discounted">${parseFloat(item.price).toFixed(2)}</span>
            )}
          </div>
          <button
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAdd}
            disabled={adding}
          >
            {added ? '✓ Added' : adding ? '…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
