import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/bookings", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT bookings.id, bookings.phone, bookings.created_at, 
              products.name AS product_name, products.category
       FROM bookings
       JOIN products ON bookings.product_id = products.id
       ORDER BY bookings.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/bookings", async (req, res) => {
  const { product_id, phone } = req.body;

  if (!product_id || !phone) {
    return res.status(400).json({ error: "Missing product or phone" });
  }

  try {
    await db.query("INSERT INTO bookings (product_id, phone) VALUES ($1, $2)", [
      product_id,
      phone,
    ]);
    res.status(201).json({ message: "Booking successful" });
  } catch (error) {
    console.error("Error inserting booking:", error);
    res.status(500).json({ error: "Failed to book" });
  }
});

// DELETE /api/bookings/:id
router.delete("/delete-booking/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM bookings WHERE id = $1", [id]);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

export default router;
