import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import bookingRoutes from "./routes/booking.js";
import dotenv from "dotenv";

dotenv.config();

const Port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bookingRoutes);

app.use(express.static("public"));

app.use(productRoutes);

const Password = process.env.DB_ADMIN_PASSWORD;
const Username = process.env.DB_USERNAME;

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username.trim() === Username && password.trim() === Password) {
    res.json({ success: true, message: "Registration successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

app.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});
