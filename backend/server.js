const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.getConnection((error, connection) => {
  if (error) {
    console.error("Database connection failed:", error.message);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

app.get("/", (req, res) => {
  res.send("Student Attendance API is running");
});

app.get("/api/students", (req, res) => {
  const sql = "SELECT * FROM students ORDER BY id ASC";

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: "Error retrieving students",
        error: error.message
      });
    }

    res.json(results);
  });
});

app.post("/api/students", (req, res) => {
  const { student_name, status } = req.body;

  if (!student_name || !status) {
    return res.status(400).json({
      message: "Student name and attendance status are required"
    });
  }

  if (status !== "Present" && status !== "Absent") {
    return res.status(400).json({
      message: "Status must be Present or Absent"
    });
  }

  const sql =
    "INSERT INTO students (student_name, status) VALUES (?, ?)";

  db.query(sql, [student_name.trim(), status], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: "Error inserting student",
        error: error.message
      });
    }

    res.status(201).json({
      id: result.insertId,
      student_name: student_name.trim(),
      status: status,
      message: "Student attendance added successfully"
    });
  });
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { student_name, status } = req.body;

  if (!student_name || !status) {
    return res.status(400).json({
      message: "Student name and attendance status are required"
    });
  }

  if (status !== "Present" && status !== "Absent") {
    return res.status(400).json({
      message: "Status must be Present or Absent"
    });
  }

  const sql =
    "UPDATE students SET student_name = ?, status = ? WHERE id = ?";

  db.query(
    sql,
    [student_name.trim(), status, id],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: "Error updating student",
          error: error.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      res.json({
        id: id,
        student_name: student_name.trim(),
        status: status,
        message: "Student attendance updated successfully"
      });
    }
  );
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM students WHERE id = ?";

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: "Error deleting student",
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

