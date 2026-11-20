import './App.css';
import ProductCard from './components/ProductCard';
import { products } from './data/products';
import { useState } from 'react';


function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredProducts = selectedCategory === 'all'
  ? products
  : products.filter((product) => product.category === selectedCategory)

  return(
    <div className="app">
      <header className="header">
        <a href ="/" className="logo">
          PIXEL<span>GEAR</span>
        </a>

        <nav className="navigation">
          <a href ="#produkty"> PRODUKTY </a>
          <a href ="#kategorie"> KATEGORIE </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="hero-label">
              SPRZĘT DLA PRAWDZIWYCH GRACZY
            </p>

            <h1>
              LEVEL UP YOUR
              <span> GAMING SETUP</span>
            </h1>

            <p className="hero-description">
            Odkryj najlepsze akcesoria gamingowe.
            Myszki, klawiatury, słuchawki i monitory,
            które przeniosą Twoją rozgrywkę na wyższy poziom.
            </p>

            <a href="#produkty" className="hero-button">
              Zobacz produkty →
            </a>
          </div>
        </section>
        <section id="produkty" className="products-section">
          <h2>Nasze produkty</h2>

          <div id="kategorie" className="category-filters">

            <button onClick={() => setSelectedCategory('all')}>
              Wszystkie
            </button>

            <button onClick={() => setSelectedCategory('mouse')}>
              Myszki
            </button>

            <button onClick={() => setSelectedCategory('keyboard')}>
              Klawiatury
            </button>

            <button onClick={() => setSelectedCategory('headphones')}>
              Słuchawki
            </button>

            <button onClick={() => setSelectedCategory('monitor')}>
              Monitory
            </button>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            )) }
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;