function ProductCard ({product, onSelect}){
    const price = product.variants[0].price; 

    const icons = {
        mouse: "🖱️",
        keyboard: "⌨️",
        headphones: "🎧",
        monitor: "🖥️"
    };

    return (
        <article className="product-card">
            <div className="product-image">
                {icons[product.category]}
            </div>

            <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-price">
                    {price} zł
                </p>

                <button
                    type="button"
                    className="product-open"
                    onClick={() => onSelect(product)}
                >
                    Zobacz szczegóły
                </button>
            </div>
        </article>
    );
}

export default ProductCard;
