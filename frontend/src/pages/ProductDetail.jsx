import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const CATEGORY_NAMES = { S: 'Shirt', SW: 'Sport wear', OW: 'Outwear' };
const LABEL_NAMES    = { P: 'New Arrival', S: 'On Sale', D: 'Limited' };

export default function ProductDetail() {
  const { slug } = useParams();
  const [item, setItem]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/items/${slug}`).then(r => setItem(r.data)).finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(item.slug);
      setMsg('Item added to your cart!');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error adding to cart');
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!item)   return <div className="container page"><p>Item not found.</p></div>;

  const finalPrice = item.discountPrice || item.price;
  const saved      = item.discountPrice ? (item.price - item.discountPrice).toFixed(2) : null;

  return (
    <div className="container page">
      <Link to="/products" className="back-link">← Back to shop</Link>
      <div className="detail-grid">
        <div className="detail-img-col">
          <img src={item.image || 'https://via.placeholder.com/500x400?text=No+Image'} alt={item.title} className="detail-img" />
        </div>
        <div className="detail-info-col">
          <div className="detail-meta">
            <span className="detail-category">{CATEGORY_NAMES[item.category]}</span>
            <span className={`badge label-${item.label}`}>{LABEL_NAMES[item.label]}</span>
          </div>
          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-pricing">
            <span className="detail-price">${parseFloat(finalPrice).toFixed(2)}</span>
            {item.discountPrice && (
              <>
                <span className="detail-original">${parseFloat(item.price).toFixed(2)}</span>
                <span className="badge badge-danger">Save ${saved}</span>
              </>
            )}
          </div>

          <p className="detail-desc">{item.description}</p>

          {msg && <div className="alert alert-success">{msg}</div>}

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleAdd}>Add to Cart</button>
            <Link to="/order-summary" className="btn btn-outline">View Cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
