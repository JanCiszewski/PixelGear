function ProductDetails ({product, onBack}) {
    const variant = product.variants?.[0];

    const icons = {
        mouse: "🖱️",
        keyboard: "⌨️",
        headphones: "🎧",
        monitor: "🖥️"
    };

    return (
        <section className = "product-details">
            <button onClick={onBack}>
                ← wróć do produktów
            </button>

            <div className="details-layout">
                <div className="details-image">
                    {icons[product.category]}
                </div>

                <div className="details-info">
                    <h1>{product.name}</h1>

                <p>
                    {product.description || "Opis produktu"}
                </p>

                <h2>{variant?.price} zł</h2>

                <p>
                    Kategoria: {product.category}
                </p>
                </div>
            </div>
        </section>
    );
}

export default ProductDetails; 