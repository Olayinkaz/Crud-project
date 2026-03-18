import app from "../backend/app.js";
import connectToDatabase from "../backend/lib/mongodb.js";

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
