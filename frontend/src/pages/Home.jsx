import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import ItemCard from '../components/ItemCard';
import './Home.css';

const CATEGORIES = [
  { code: 'S',  name: 'Shirts',      icon: '👔' },
  { code: 'SW', name: 'Sport Wear',  icon: '🏃' },
  { code: 'OW', name: 'Outwear',     icon: '🧥' },
];

export default function Home() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/items?limit=8').then(r => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero — matches Django home.html jumbotron */}
      <section className="hero">
        <div className="container hero-inner">
          <h1>Fresh Styles,<br /><span>Great Prices.</span></h1>
          <p>Shirts, sport wear, and outwear — everything you need, deployed on AWS.</p>
          <div className="hero-btns">
            <Link to="/products" className="btn btn-primary">Shop Now →</Link>
            <Link to="/register" className="btn btn-outline" style={{color:'#fff',borderColor:'rgba(255,255,255,.5)'}}>Create Account</Link>
          </div>
        </div>
      </section>

      <div className="container page">
        {/* Categories */}
        <section className="section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="cat-grid">
            {CATEGORIES.map(c => (
              <Link key={c.code} to={`/products?category=${c.code}`} className="cat-card card">
                <span className="cat-icon">{c.icon}</span>
                <span className="cat-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Items */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Latest Arrivals</h2>
            <Link to="/products" className="btn btn-outline btn-sm">View all →</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            items.length > 0
              ? <div className="grid-4">{items.map(i => <ItemCard key={i.id} item={i} />)}</div>
              : <div className="empty-state"><h3>No items yet</h3><p>Check back soon!</p></div>
          )}
        </section>
      </div>
    </div>
  );
}
