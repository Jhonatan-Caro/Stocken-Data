import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import salesRoutes from "./modules/sales/sales.routes.js";
import chatBotRoutes from "./modules/chatbot/chatbot.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/sales", salesRoutes);
app.use(chatBotRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando ✅");
});

app.use((err, req, res, next) => {
  console.error("Error global:", err.message, err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
