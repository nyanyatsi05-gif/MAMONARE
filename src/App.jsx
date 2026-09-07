import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState("Present");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const getStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      setMessage("Could not retrieve students.");
      console.error(error);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  const clearForm = () => {
    setStudentName("");
    setStatus("Present");
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentName.trim()) {
      setMessage("Please enter a student name.");
      return;
    }

    try {
      if (editingId === null) {
        await axios.post(API_URL, {
          student_name: studentName.trim(),
          status: status
        });

        setMessage("Student added successfully.");
      } else {
        await axios.put(`${API_URL}/${editingId}`, {
          student_name: studentName.trim(),
          status: status
        });

        setMessage("Student updated successfully.");
      }

      clearForm();
      await getStudents();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred."
      );
      console.error(error);
    }
  };

  const editStudent = (student) => {
    setEditingId(student.id);
    setStudentName(student.student_name);
    setStatus(student.status);
    setMessage("");
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Student Attendance</h1>

        <form onSubmit={handleSubmit} className="marks-form">
          <label htmlFor="studentName">Student Name</label>

          <input
            id="studentName"
            type="text"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Enter student name"
          />

          <label htmlFor="status">Attendance Status</label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>

          <button type="submit">
            {editingId === null ? "Add Student" : "Update Student"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-button"
              onClick={clearForm}
            >
              Cancel
            </button>
          )}
        </form>

        {message && <p className="message">{message}</p>}

        <h2>Student Attendance List</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.student_name}</td>
                <td>{student.status}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => editStudent(student)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;