import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import categoriasRoutes from "./modules/categorys/categorias.routes.js";
import ventasRoutes from "./modules/sales/ventas.routes.js";
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
app.use("/api/productos", productsRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/ventas", ventasRoutes);
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
