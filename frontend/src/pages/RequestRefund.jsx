import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api';
import './RequestRefund.css';

export default function RequestRefund() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    refCode: searchParams.get('ref') || '',
    reason: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await API.post('/refunds', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit refund request.');
    } finally { setLoading(false); }
  };

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  if (submitted) return (
    <div className="container page">
      <div className="refund-success card">
        <span className="refund-icon">✅</span>
        <h2>Request received</h2>
        <p>Your refund request has been submitted. We'll review it and get back to you shortly.</p>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Back to Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <h1 className="page-title">Request a Refund</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="refund-form-wrap card">
        <p className="refund-intro">
          Found a problem with your order? Fill in the form below and our team will review your request.
        </p>
        <hr className="divider" />
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Order Reference Code *</label>
            <input required placeholder="e.g. ab12cd34ef56gh78ij90" {...f('refCode')} />
          </div>
          <div className="form-group">
            <label>Your Email *</label>
            <input type="email" required placeholder="email@example.com" {...f('email')} />
          </div>
          <div className="form-group">
            <label>Reason for Refund *</label>
            <textarea required rows={5} placeholder="Please describe the issue with your order…" {...f('reason')} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Refund Request'}
            </button>
            <Link to="/orders" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
