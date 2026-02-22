import express from "express";
import cors from "cors";
import { prisma } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

// create user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    // ✅ validation
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await prisma.user.create({
      data: { name, email }
    });

    res.json(user);

  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// create plan
app.post("/plans", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const plan = await prisma.plan.create({
      data: { title }
    });

    res.json(plan);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/plans/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  // ✅ validation
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email }
    });

    res.json(user);

  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: "User deleted" });

  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

app.get("/test-db", async (req, res) => {
  const result = await prisma.$queryRaw`SELECT NOW()`;
  res.json({ database_time: result });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
