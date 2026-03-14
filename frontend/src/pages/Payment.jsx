import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useCart } from '../context/CartContext';
import './Payment.css';

export default function Payment() {
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState('');
  const [saveCard,  setSaveCard]  = useState(false);
  const [useDefault,setUseDefault]= useState(false);
  // Simulated Stripe token (in real app use Stripe.js)
  const [cardNum,   setCardNum]   = useState('4242 4242 4242 4242');
  const [expiry,    setExpiry]    = useState('12/26');
  const [cvc,       setCvc]       = useState('123');
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/payment').then(r => setOrderInfo(r.data)).catch(err => {
      setError(err.response?.data?.message || 'Error loading order.');
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setPaying(true); setError('');
    try {
      // In production: use Stripe.js to tokenize card then send token
      const { data } = await API.post('/payment', {
        stripeToken: 'tok_visa', // test token — replace with real Stripe.js token
        save: saveCard,
        useDefault,
      });
      await fetchCart();
      navigate(`/orders?success=1&ref=${data.refCode}`);
    } catch (err) { setError(err.response?.data?.message || 'Payment failed.'); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="container page">
      <h1 className="page-title">Payment</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="payment-layout">
        {/* Card form */}
        <div className="payment-card card">
          <h3>Card Details</h3>
          <p className="payment-note">Test mode — use card 4242 4242 4242 4242</p>
          <hr className="divider" />
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Card number</label>
              <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Expiry</label><input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" /></div>
              <div className="form-group"><label>CVC</label><input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" /></div>
            </div>
            {orderInfo?.order?.user?.stripeCustomerId && (
              <div className="form-check" style={{ marginBottom: '.75rem' }}>
                <input type="checkbox" id="useDefault" checked={useDefault} onChange={e => setUseDefault(e.target.checked)} />
                <label htmlFor="useDefault">Use saved card</label>
              </div>
            )}
            <div className="form-check" style={{ marginBottom: '1.25rem' }}>
              <input type="checkbox" id="saveCard" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
              <label htmlFor="saveCard">Save card for future purchases</label>
            </div>
            <button className="btn btn-primary btn-block" disabled={paying} type="submit">
              {paying ? 'Processing…' : `Pay $${(orderInfo?.total || 0).toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <aside className="payment-summary card">
          <h3>Order Total</h3>
          <hr className="divider" />
          <div className="ps-row"><span>Subtotal</span><span>${(orderInfo?.total || 0).toFixed(2)}</span></div>
          <div className="ps-row"><span>Shipping</span><span style={{ color: 'var(--success)' }}>Free</span></div>
          <hr className="divider" />
          <div className="ps-total"><strong>Total</strong><strong>${(orderInfo?.total || 0).toFixed(2)}</strong></div>
          <Link to="/checkout" className="btn btn-outline btn-sm btn-block" style={{ marginTop: '1rem' }}>← Edit checkout</Link>
        </aside>
      </div>
    </div>
  );
}
