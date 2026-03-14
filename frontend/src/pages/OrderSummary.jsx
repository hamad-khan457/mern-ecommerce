import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import API from '../api';
import './OrderSummary.css';

export default function OrderSummary() {
  const { cart, removeFromCart, removeSingle, addToCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg,  setCouponMsg]  = useState('');
  const [applying,   setApplying]   = useState(false);
  const navigate = useNavigate();

  const items = cart?.items || [];

  const applyCoupon = async (e) => {
    e.preventDefault(); setApplying(true); setCouponMsg('');
    try {
      await API.post('/coupons/apply', { code: couponCode });
      setCouponMsg('Coupon applied!');
      window.location.reload();
    } catch (err) { setCouponMsg(err.response?.data?.message || 'Invalid coupon'); }
    finally { setApplying(false); }
  };

  if (!items.length) return (
    <div className="container page">
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse the shop and add items!</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <h1 className="page-title">Order Summary</h1>
      <div className="summary-layout">
        {/* Items table */}
        <div className="summary-items">
          {items.map(oi => (
            <div key={oi.id} className="summary-row-item card">
              <img src={oi.item?.image || 'https://via.placeholder.com/72x72'} alt={oi.item?.title} />
              <div className="sri-info">
                <Link to={`/product/${oi.item?.slug}`} className="sri-title">{oi.item?.title}</Link>
                {oi.amountSaved > 0 && (
                  <span className="sri-saving">You save ${oi.amountSaved.toFixed(2)}</span>
                )}
              </div>
              <div className="sri-qty">
                <button className="qty-btn" onClick={() => removeSingle(oi.item?.slug)}>−</button>
                <span>{oi.quantity}</span>
                <button className="qty-btn" onClick={() => addToCart(oi.item?.slug)}>+</button>
              </div>
              <span className="sri-price">${oi.finalPrice.toFixed(2)}</span>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(oi.item?.slug)}>✕</button>
            </div>
          ))}
        </div>

        {/* Sidebar summary */}
        <aside className="summary-aside card">
          <h3>Cart Total</h3>
          <hr className="divider" />
          {items.map(oi => (
            <div key={oi.id} className="aside-line">
              <span>{oi.item?.title} × {oi.quantity}</span>
              <span>${oi.finalPrice.toFixed(2)}</span>
            </div>
          ))}
          {cart?.coupon && (
            <div className="aside-line coupon-line">
              <span>Coupon ({cart.coupon.code})</span>
              <span>− ${cart.coupon.amount.toFixed(2)}</span>
            </div>
          )}
          <hr className="divider" />
          <div className="aside-total">
            <strong>Total</strong>
            <strong>${(cart?.total || 0).toFixed(2)}</strong>
          </div>

          {/* Coupon form */}
          <form onSubmit={applyCoupon} className="coupon-form">
            <input placeholder="Promo code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
            <button className="btn btn-outline btn-sm" disabled={applying}>{applying ? '…' : 'Apply'}</button>
          </form>
          {couponMsg && <p className={`coupon-msg ${couponMsg.includes('!') ? 'ok' : 'err'}`}>{couponMsg}</p>}

          <button className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
          <Link to="/products" className="btn btn-outline btn-block" style={{ marginTop: '.5rem' }}>Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
