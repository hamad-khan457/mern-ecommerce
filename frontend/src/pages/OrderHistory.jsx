import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import './OrderHistory.css';

function statusBadge(order) {
  if (order.refundGranted)    return <span className="badge badge-danger">Refund Granted</span>;
  if (order.refundRequested)  return <span className="badge badge-secondary">Refund Pending</span>;
  if (order.received)         return <span className="badge badge-success">Delivered</span>;
  if (order.beingDelivered)   return <span className="badge badge-primary">In Transit</span>;
  return <span className="badge badge-secondary">Processing</span>;
}

export default function OrderHistory() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const ref     = searchParams.get('ref');

  useEffect(() => {
    API.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <h1 className="page-title">My Orders</h1>

      {success && (
        <div className="alert alert-success">
          🎉 Order placed! Reference code: <strong>{ref}</strong>
        </div>
      )}

      {loading ? <div className="spinner" /> : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Place your first order!</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card card">
              <div className="order-header">
                <div>
                  <p className="order-ref">Order #{order.refCode}</p>
                  <p className="order-date">{new Date(order.orderedDate || order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="order-header-right">
                  {statusBadge(order)}
                  <span className="order-total">${parseFloat(order.payment?.amount || 0).toFixed(2)}</span>
                </div>
              </div>
              <hr className="divider" />
              <div className="order-items">
                {(order.items || []).map(oi => (
                  <div key={oi.id} className="order-item-row">
                    <img src={oi.item?.image || 'https://via.placeholder.com/48x48'} alt={oi.item?.title} />
                    <span className="oi-title">{oi.item?.title}</span>
                    <span className="oi-qty">× {oi.quantity}</span>
                    <span className="oi-price">${(oi.quantity * (oi.item?.discountPrice || oi.item?.price || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {!order.refundRequested && order.received && (
                <div style={{ marginTop: '.75rem' }}>
                  <Link to={`/request-refund?ref=${order.refCode}`} className="btn btn-outline btn-sm">Request Refund</Link>
                </div>
              )}
              {!order.received && order.beingDelivered && (
                <button className="btn btn-success btn-sm" style={{ marginTop: '.75rem' }}
                  onClick={async () => {
                    await API.put(`/orders/${order.id}/receive`);
                    setOrders(os => os.map(o => o.id === order.id ? {...o, received: true} : o));
                  }}>
                  Mark as Received
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
