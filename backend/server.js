const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });


// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.send("Todo App Backend is Running!");
});


// ===============================
// REGISTER USER
// ===============================

app.post("/api/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    console.log("Register Request:", req.body);

    // Check fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword
    });

    // Save user
    await newUser.save();

    console.log("User Registered Successfully!");

    res.status(201).json({
      message: "Registration successful!"
    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ===============================
// LOGIN USER
// ===============================

app.post("/api/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    console.log("Login Request:", req.body);

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    console.log("User Login Successful!");

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ===============================
// CREATE TASK
// ===============================

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({
        message: "Task title and user ID are required"
      });
    }

    const task = new Task({
      title: title,
      user: userId
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully!",
      task: task
    });

  } catch (error) {
    console.log("CREATE TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ===============================
// GET ALL TASKS
// ===============================

app.get("/api/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await Task.find({
      user: userId
    }).sort({
      createdAt: -1
    });

    res.status(200).json(tasks);

  } catch (error) {
    console.log("GET TASKS ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ===============================
// UPDATE TASK
// ===============================

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        completed: completed
      },
      {
        new: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task updated successfully!",
      task: task
    });

  } catch (error) {
    console.log("UPDATE TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


// ===============================
// DELETE TASK
// ===============================

app.delete("/api/tasks/:id", async (req, res) => {
  try {

    const task = await Task.findByIdAndDelete(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully!"
    });

  } catch (error) {
    console.log("DELETE TASK ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});
// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});