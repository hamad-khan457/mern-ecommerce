import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar     from './components/Navbar';
import Footer     from './components/Footer';
import Home       from './pages/Home';
import Products   from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import { Login, Register } from './pages/Auth';
import OrderSummary  from './pages/OrderSummary';
import Checkout      from './pages/Checkout';
import Payment       from './pages/Payment';
import OrderHistory  from './pages/OrderHistory';
import RequestRefund from './pages/RequestRefund';
import AdminDashboard from './pages/admin/AdminDashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
}
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user?.isAdmin ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/products"       element={<Products />} />
            <Route path="/product/:slug"  element={<ProductDetail />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/order-summary"  element={<PrivateRoute><OrderSummary /></PrivateRoute>} />
            <Route path="/checkout"       element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/payment"        element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/orders"         element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
            <Route path="/request-refund" element={<PrivateRoute><RequestRefund /></PrivateRoute>} />
            <Route path="/admin/*"        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
