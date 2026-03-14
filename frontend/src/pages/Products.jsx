import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import ItemCard from '../components/ItemCard';
import './Products.css';

const CATS = [{ code: '', name: 'All' }, { code: 'S', name: 'Shirts' }, { code: 'SW', name: 'Sport Wear' }, { code: 'OW', name: 'Outwear' }];

export default function Products() {
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 12 });
    if (search)   p.set('search', search);
    if (category) p.set('category', category);
    API.get(`/items?${p}`).then(r => {
      setItems(r.data.items);
      setTotal(r.data.total);
      setPages(r.data.pages);
    }).finally(() => setLoading(false));
  }, [search, category, page]);

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams);
    val ? p.set(key, val) : p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="container page">
      <div className="products-layout">
        {/* Sidebar */}
        <aside className="sidebar card">
          <h3>Filter</h3>
          <hr className="divider" />
          <p className="filter-label">Category</p>
          {CATS.map(c => (
            <button
              key={c.code}
              className={`filter-btn ${category === c.code ? 'active' : ''}`}
              onClick={() => set('category', c.code)}
            >{c.name}</button>
          ))}
        </aside>

        {/* Main */}
        <main>
          <div className="products-topbar">
            <input
              className="search-input"
              placeholder="Search items…"
              defaultValue={search}
              onKeyDown={e => { if (e.key === 'Enter') set('search', e.target.value); }}
            />
            <span className="result-count">{total} item{total !== 1 ? 's' : ''}</span>
          </div>

          {loading ? <div className="spinner" /> : items.length === 0 ? (
            <div className="empty-state"><h3>No items found</h3><p>Try different filters</p></div>
          ) : (
            <>
              <div className="grid-3">{items.map(i => <ItemCard key={i.id} item={i} />)}</div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={`page-btn ${n === page ? 'active' : ''}`}
                      onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', n); setSearchParams(p); }}
                    >{n}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
