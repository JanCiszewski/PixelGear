function ProductCard ({product}){
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
            </div>
        </article>
    );
}

export default ProductCard;
