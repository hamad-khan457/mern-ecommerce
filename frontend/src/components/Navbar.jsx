import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">🛍️ DjEcommerce</Link>
        <div className="nav-links">
          <Link to="/products">Shop</Link>
          {user ? (
            <>
              <Link to="/order-summary" className="cart-link">
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders">My Orders</Link>
              {user.isAdmin && <Link to="/admin">Admin</Link>}
              <span className="nav-user">{user.firstName || user.username}</span>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
