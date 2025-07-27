import express from "express";
import multer from "multer";
import db from "../db.js";
import cloudinary from "../utils/cloudinary.js";
import dotenv from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();
const router = express.Router();

/** 🔄 Cloudinary Multer Storage Setup */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shop-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});
const upload = multer({ storage });

/** ➕ Add Product with Cloudinary Upload */
router.post("/add-product", upload.single("image"), async (req, res) => {
  const { name, category, price, description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const imageUrl = req.file.path; // Cloudinary secure URL
    const publicId = req.file.filename; // Cloudinary public_id

    // Insert into DB
    await db.query(
      `INSERT INTO products (name, image, category, price, description, public_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, imageUrl, category, price, description, publicId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

/** 📦 Get all products */
router.get("/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

/** 📦 Get products by category */
router.get("/products/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM products WHERE category = $1",
      [category]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

/** ❌ Delete product + Cloudinary image */
router.delete("/delete-product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT public_id FROM products WHERE id = $1",
      [id]
    );

    const publicId = result.rows[0]?.public_id;

    await db.query("DELETE FROM products WHERE id = $1", [id]);

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
