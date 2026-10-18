const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/api/basic", (req, res) => {
    res.json({
        status: "OK",
        message: "PixelGear API is working"
    });
});

const productRoutes = require("./routes/productRoutes");

app.use("/api/products", productRoutes);

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}` )
        });

    } catch (error) {
        console.error("Błąd połączenia z bazą danych", error.message);
        process.exit(1);
    }
}

startServer();