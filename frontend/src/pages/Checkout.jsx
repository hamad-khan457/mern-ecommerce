import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './Checkout.css';

const COUNTRIES = [
  ['US','United States'],['GB','United Kingdom'],['PK','Pakistan'],['IN','India'],
  ['CA','Canada'],['AU','Australia'],['DE','Germany'],['FR','France'],['AE','UAE'],
];

export default function Checkout() {
  const [addresses,       setAddresses]       = useState([]);
  const [useDefaultShip,  setUseDefaultShip]  = useState(false);
  const [setDefaultShip,  setSetDefaultShip]  = useState(false);
  const [useDefaultBill,  setUseDefaultBill]  = useState(false);
  const [setDefaultBill,  setSetDefaultBill]  = useState(false);
  const [sameBilling,     setSameBilling]     = useState(true);
  const [paymentOption,   setPaymentOption]   = useState('stripe');
  const [ship, setShip] = useState({ street: '', apartment: '', country: 'US', zip: '' });
  const [bill, setBill] = useState({ street: '', apartment: '', country: 'US', zip: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/addresses').then(r => {
      setAddresses(r.data);
      if (r.data.some(a => a.addressType === 'S' && a.isDefault)) setUseDefaultShip(true);
      if (r.data.some(a => a.addressType === 'B' && a.isDefault)) setUseDefaultBill(true);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await API.post('/checkout', {
        useDefaultShipping: useDefaultShip, setDefaultShipping: setDefaultShip,
        shippingStreet: ship.street, shippingApartment: ship.apartment,
        shippingCountry: ship.country, shippingZip: ship.zip,
        useDefaultBilling: useDefaultBill, setDefaultBilling: setDefaultBill,
        sameBillingAddress: sameBilling,
        billingStreet: bill.street, billingApartment: bill.apartment,
        billingCountry: bill.country, billingZip: bill.zip,
        paymentOption,
      });
      navigate('/payment');
    } catch (err) { setError(err.response?.data?.message || 'Checkout failed.'); }
    finally { setLoading(false); }
  };

  const sf = k => ({ value: ship[k], onChange: e => setShip({...ship, [k]: e.target.value}) });
  const bf = k => ({ value: bill[k], onChange: e => setBill({...bill, [k]: e.target.value}) });

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={submit} className="checkout-grid">
        {/* Shipping */}
        <div className="checkout-section card">
          <h3>Shipping Address</h3>
          <hr className="divider" />
          {addresses.some(a => a.addressType === 'S' && a.isDefault) && (
            <div className="form-check">
              <input type="checkbox" id="useDefaultShip" checked={useDefaultShip}
                onChange={e => setUseDefaultShip(e.target.checked)} />
              <label htmlFor="useDefaultShip">Use default shipping address</label>
            </div>
          )}
          {!useDefaultShip && (
            <>
              <div className="form-group"><label>Street address *</label><input required {...sf('street')} /></div>
              <div className="form-group"><label>Apartment / suite</label><input {...sf('apartment')} /></div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Country *</label>
                  <select required value={ship.country} onChange={e => setShip({...ship, country: e.target.value})}>
                    {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>ZIP / Postal *</label><input required {...sf('zip')} /></div>
              </div>
              <div className="form-check">
                <input type="checkbox" id="setDefaultShip" checked={setDefaultShip}
                  onChange={e => setSetDefaultShip(e.target.checked)} />
                <label htmlFor="setDefaultShip">Save as default shipping address</label>
              </div>
            </>
          )}
        </div>

        {/* Billing */}
        <div className="checkout-section card">
          <h3>Billing Address</h3>
          <hr className="divider" />
          <div className="form-check">
            <input type="checkbox" id="sameBilling" checked={sameBilling}
              onChange={e => setSameBilling(e.target.checked)} />
            <label htmlFor="sameBilling">Same as shipping address</label>
          </div>
          {!sameBilling && (
            <>
              {addresses.some(a => a.addressType === 'B' && a.isDefault) && (
                <div className="form-check">
                  <input type="checkbox" id="useDefaultBill" checked={useDefaultBill}
                    onChange={e => setUseDefaultBill(e.target.checked)} />
                  <label htmlFor="useDefaultBill">Use default billing address</label>
                </div>
              )}
              {!useDefaultBill && (
                <>
                  <div className="form-group"><label>Street address *</label><input required={!sameBilling} {...bf('street')} /></div>
                  <div className="form-group"><label>Apartment / suite</label><input {...bf('apartment')} /></div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Country *</label>
                      <select value={bill.country} onChange={e => setBill({...bill, country: e.target.value})}>
                        {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>ZIP / Postal *</label><input required={!sameBilling} {...bf('zip')} /></div>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" id="setDefaultBill" checked={setDefaultBill}
                      onChange={e => setSetDefaultBill(e.target.checked)} />
                    <label htmlFor="setDefaultBill">Save as default billing address</label>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Payment method */}
        <div className="checkout-section card">
          <h3>Payment Method</h3>
          <hr className="divider" />
          <div className="payment-options">
            <label className={`payment-opt ${paymentOption === 'stripe' ? 'selected' : ''}`}>
              <input type="radio" value="stripe" checked={paymentOption === 'stripe'} onChange={() => setPaymentOption('stripe')} />
              💳 Stripe
            </label>
            <label className={`payment-opt ${paymentOption === 'paypal' ? 'selected' : ''}`}>
              <input type="radio" value="paypal" checked={paymentOption === 'paypal'} onChange={() => setPaymentOption('paypal')} />
              🅿️ PayPal
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1/-1', justifySelf: 'end', minWidth: '200px' }} disabled={loading}>
          {loading ? 'Saving…' : 'Continue to Payment →'}
        </button>
      </form>
    </div>
  );
}
