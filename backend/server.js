import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import authMiddleware from "./middleware/auth.js";
import Item from "./models/Item.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
  })
);
app.use(express.json());

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function validateItemPayload(body) {
  const name = body.name?.trim();
  const description = body.description?.trim();

  if (!name || !description) {
    return {
      error: "Name and description are required.",
    };
  }

  return { name, description };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id);

    res.json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/items", authMiddleware, async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    const query = { createdBy: req.userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.post("/api/items", authMiddleware, async (req, res, next) => {
  try {
    const { error, name, description } = validateItemPayload(req.body);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const item = await Item.create({
      name,
      description,
      createdBy: req.userId,
    });

    res.status(201).json({
      message: "Item created successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/items/:itemId", authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({
        message: "Invalid item id.",
      });
    }

    const { error, name, description } = validateItemPayload(req.body);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.itemId,
        createdBy: req.userId,
      },
      {
        name,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    res.json({
      message: "Item updated successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/items/:itemId", authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({
        message: "Invalid item id.",
      });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.itemId,
      createdBy: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    res.json({
      message: "Item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Duplicate value detected." });
  }

  res.status(500).json({ message: "Internal server error." });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
