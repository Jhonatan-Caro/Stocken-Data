import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import salesRoutes from "./modules/sales/sales.routes.js";
import chatBotRoutes from "./modules/chatbot/chatbot.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
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
