import './App.css';
import ProductCard from './components/ProductCard';
import { products } from './data/products';
import { useState } from 'react';
import ProductDetails from './components/ProductDetails';


function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = 
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });
  

  return(
    <div className="app">
      <header className="header">
        <a href ="/" className="logo">
          PIXEL<span>GEAR</span>
        </a>

        <nav className="navigation">
          <a href="#wyszukiwarka" className="search-link" aria-label="Przejdź do wyszukiwarki">
            SZUKAJ...
          </a>
          <a href ="#produkty"> PRODUKTY </a>
          <a href ="#kategorie"> KATEGORIE </a>
        </nav>
      </header>

      <main>
        {selectedProduct ? (
          <ProductDetails
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
          />
        ) : (
          <>
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

          <input
            id="wyszukiwarka"
            type="search"
            className="product-search"
            placeholder="Szukaj produktu..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

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
                onSelect={(product) => {
                  setSelectedProduct(product);
                  window.scrollTo(0, 0);
                }}
              />
            )) }
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;