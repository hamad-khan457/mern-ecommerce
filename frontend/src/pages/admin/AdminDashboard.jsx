import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api';
import './AdminDashboard.css';

/* ─── Sub-pages ──────────────────────────────────────────────────────── */

function AdminItems() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ title:'', price:'', discountPrice:'', category:'S', label:'P', slug:'', description:'', image:'' });
  const [editing, setEditing] = useState(null);
  const [msg,     setMsg]     = useState('');

  const load = () => API.get('/items?limit=100').then(r => setItems(r.data.items)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const slugify = (t) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null };
      if (editing) await API.put(`/items/${editing}`, payload);
      else         await API.post('/items', payload);
      setMsg('Saved!'); setForm({ title:'', price:'', discountPrice:'', category:'S', label:'P', slug:'', description:'', image:'' }); setEditing(null);
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this item?')) return;
    await API.delete(`/items/${id}`); load();
  };

  const edit = (item) => {
    setEditing(item.id);
    setForm({ title: item.title, price: item.price, discountPrice: item.discountPrice || '', category: item.category, label: item.label, slug: item.slug, description: item.description, image: item.image || '' });
    window.scrollTo(0, 0);
  };

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div>
      <h2 className="admin-section-title">{editing ? 'Edit Item' : 'Add New Item'}</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      <form onSubmit={save} className="admin-form card">
        <div className="grid-2">
          <div className="form-group"><label>Title *</label>
            <input required {...f('title')} onChange={e => { setForm({...form, title: e.target.value, slug: slugify(e.target.value)}); }} /></div>
          <div className="form-group"><label>Slug *</label><input required {...f('slug')} /></div>
          <div className="form-group"><label>Price ($) *</label><input type="number" step=".01" required {...f('price')} /></div>
          <div className="form-group"><label>Discount Price ($)</label><input type="number" step=".01" {...f('discountPrice')} /></div>
          <div className="form-group">
            <label>Category *</label>
            <select required {...f('category')}>
              <option value="S">Shirt</option>
              <option value="SW">Sport wear</option>
              <option value="OW">Outwear</option>
            </select>
          </div>
          <div className="form-group">
            <label>Label *</label>
            <select required {...f('label')}>
              <option value="P">Primary (New)</option>
              <option value="S">Secondary (Sale)</option>
              <option value="D">Danger (Hot)</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Description *</label><textarea required rows={3} {...f('description')} /></div>
        <div className="form-group"><label>Image URL (or upload via S3)</label><input placeholder="https://…" {...f('image')} /></div>
        <div style={{ display:'flex', gap:'1rem' }}>
          <button className="btn btn-primary" type="submit">{editing ? 'Update Item' : 'Add Item'}</button>
          {editing && <button className="btn btn-outline" type="button" onClick={() => { setEditing(null); setForm({ title:'', price:'', discountPrice:'', category:'S', label:'P', slug:'', description:'', image:'' }); }}>Cancel</button>}
        </div>
      </form>

      <h2 className="admin-section-title" style={{ marginTop:'2rem' }}>All Items ({items.length})</h2>
      {loading ? <div className="spinner" /> : (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Discount</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td><img src={i.image || 'https://via.placeholder.com/48'} alt={i.title} className="admin-thumb" /></td>
                  <td><strong>{i.title}</strong><br /><span style={{fontSize:'.75rem',color:'var(--muted)'}}>{i.slug}</span></td>
                  <td>{i.category === 'S' ? 'Shirt' : i.category === 'SW' ? 'Sport wear' : 'Outwear'}</td>
                  <td>${parseFloat(i.price).toFixed(2)}</td>
                  <td>{i.discountPrice ? `$${parseFloat(i.discountPrice).toFixed(2)}` : '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => edit(i)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm"  onClick={() => del(i.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { API.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false)); }, []);

  const deliver = async (id) => {
    await API.put(`/orders/${id}/deliver`);
    setOrders(os => os.map(o => o.id === id ? { ...o, beingDelivered: true } : o));
  };
  const grantRefund = async (id) => {
    await API.put(`/orders/${id}/grant-refund`);
    setOrders(os => os.map(o => o.id === id ? { ...o, refundGranted: true } : o));
  };

  const statusLabel = (o) => {
    if (o.refundGranted)  return <span className="badge badge-danger">Refund Granted</span>;
    if (o.refundRequested)return <span className="badge badge-secondary">Refund Requested</span>;
    if (o.received)       return <span className="badge badge-success">Received</span>;
    if (o.beingDelivered) return <span className="badge badge-primary">In Transit</span>;
    return <span className="badge badge-secondary">Processing</span>;
  };

  if (loading) return <div className="spinner" />;
  return (
    <div>
      <h2 className="admin-section-title">All Orders ({orders.length})</h2>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>Ref Code</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><code style={{fontSize:'.75rem'}}>{o.refCode}</code></td>
                <td>{o.user?.email || '—'}</td>
                <td>{(o.items || []).length} item(s)</td>
                <td>${parseFloat(o.payment?.amount || 0).toFixed(2)}</td>
                <td>{statusLabel(o)}</td>
                <td style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  {!o.beingDelivered && !o.received && (
                    <button className="btn btn-primary btn-sm" onClick={() => deliver(o.id)}>Mark Shipped</button>
                  )}
                  {o.refundRequested && !o.refundGranted && (
                    <button className="btn btn-danger btn-sm" onClick={() => grantRefund(o.id)}>Grant Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form,    setForm]    = useState({ code:'', amount:'' });
  const [msg,     setMsg]     = useState('');

  const load = () => API.get('/coupons').then(r => setCoupons(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await API.post('/coupons', { code: form.code, amount: parseFloat(form.amount) });
      setMsg('Coupon created!'); setForm({ code:'', amount:'' }); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const del = async (id) => {
    await API.delete(`/coupons/${id}`); load();
  };

  return (
    <div>
      <h2 className="admin-section-title">Coupon Codes</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      <form onSubmit={add} className="admin-form card">
        <div className="grid-2">
          <div className="form-group"><label>Code *</label><input required placeholder="SAVE10" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} /></div>
          <div className="form-group"><label>Discount Amount ($) *</label><input type="number" step=".01" required placeholder="10.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
        </div>
        <button className="btn btn-primary" type="submit">Create Coupon</button>
      </form>
      <div className="admin-table-wrap card" style={{ marginTop:'1.5rem' }}>
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Discount</th><th>Action</th></tr></thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td><code>{c.code}</code></td>
                <td>${parseFloat(c.amount).toFixed(2)}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => del(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRefunds() {
  const [refunds,  setRefunds]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = () => API.get('/refunds').then(r => setRefunds(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    await API.put(`/refunds/${id}/accept`);
    setRefunds(rs => rs.map(r => r.id === id ? { ...r, accepted: true } : r));
  };

  if (loading) return <div className="spinner" />;
  return (
    <div>
      <h2 className="admin-section-title">Refund Requests ({refunds.length})</h2>
      {refunds.length === 0 ? <div className="empty-state"><h3>No refund requests</h3></div> : (
        <div className="admin-table-wrap card">
          <table className="admin-table">
            <thead><tr><th>Ref Code</th><th>Email</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {refunds.map(r => (
                <tr key={r.id}>
                  <td><code style={{fontSize:'.75rem'}}>{r.order?.refCode}</code></td>
                  <td>{r.email}</td>
                  <td style={{maxWidth:'240px',fontSize:'.82rem',color:'var(--muted)'}}>{r.reason}</td>
                  <td>{r.accepted ? <span className="badge badge-success">Accepted</span> : <span className="badge badge-secondary">Pending</span>}</td>
                  <td>{!r.accepted && <button className="btn btn-success btn-sm" onClick={() => accept(r.id)}>Accept</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard shell ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const location = useLocation();
  const nav = [
    { path: '/admin',         label: '📊 Overview'  },
    { path: '/admin/items',   label: '👕 Items'     },
    { path: '/admin/orders',  label: '📦 Orders'    },
    { path: '/admin/coupons', label: '🏷️ Coupons'  },
    { path: '/admin/refunds', label: '↩️ Refunds'   },
  ];

  return (
    <div className="admin-layout container">
      <aside className="admin-sidebar card">
        <h3 className="admin-brand">Admin Panel</h3>
        <nav className="admin-nav">
          {nav.map(n => (
            <Link key={n.path} to={n.path}
              className={`admin-nav-link ${location.pathname === n.path ? 'active' : ''}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="btn btn-outline btn-sm" style={{ margin:'1rem', display:'block', textAlign:'center' }}>← Back to Shop</Link>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route path="/"       element={<AdminOverview />} />
          <Route path="/items"  element={<AdminItems />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/coupons"element={<AdminCoupons />} />
          <Route path="/refunds"element={<AdminRefunds />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({ items:0, orders:0, coupons:0, refunds:0 });
  useEffect(() => {
    Promise.all([
      API.get('/items?limit=1'),
      API.get('/orders'),
      API.get('/coupons'),
      API.get('/refunds'),
    ]).then(([i, o, c, r]) => setStats({
      items:   i.data.total,
      orders:  o.data.length,
      coupons: c.data.length,
      refunds: r.data.length,
    })).catch(() => {});
  }, []);

  const cards = [
    { label:'Total Items',    value: stats.items,   link:'/admin/items',   icon:'👕' },
    { label:'Total Orders',   value: stats.orders,  link:'/admin/orders',  icon:'📦' },
    { label:'Active Coupons', value: stats.coupons, link:'/admin/coupons', icon:'🏷️' },
    { label:'Refund Requests',value: stats.refunds, link:'/admin/refunds', icon:'↩️' },
  ];

  return (
    <div>
      <h2 className="admin-section-title">Overview</h2>
      <div className="grid-4">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="stat-card card">
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
