import React, { useEffect, useState } from "react";

function App() {
  // ===============================
  // Login / Register
  // ===============================

  const [isLogin, setIsLogin] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

  // ===============================
  // Todo Tasks
  // ===============================

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // ===============================
  // REGISTER
  // ===============================

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");

        setName("");
        setEmail("");
        setPassword("");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Backend server is not connected.");
    }
  };

  // ===============================
  // LOGIN
  // ===============================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful!");

        setLoggedInUser(data.user);

        setEmail("");
        setPassword("");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Backend server is not connected.");
    }
  };

  // ===============================
  // GET TASKS
  // ===============================

  const fetchTasks = async () => {
    if (!loggedInUser) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${loggedInUser.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      }
    } catch (error) {
      console.log("Get tasks error:", error);
    }
  };

  // ===============================
  // Load tasks after login
  // ===============================

  useEffect(() => {
    if (loggedInUser) {
      fetchTasks();
    }
  }, [loggedInUser]);

  // ===============================
  // ADD TASK
  // ===============================

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskTitle,
            userId: loggedInUser.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTaskTitle("");

        fetchTasks();
      } else {
        alert(data.message || "Task could not be added");
      }
    } catch (error) {
      alert("Backend server is not connected.");
    }
  };

  // ===============================
  // DELETE TASK
  // ===============================

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.log("Delete task error:", error);
    }
  };

  // ===============================
  // START EDIT
  // ===============================

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  };

  // ===============================
  // UPDATE TASK
  // ===============================

  const handleUpdateTask = async (task) => {
    if (!editingTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingTitle,
            completed: task.completed,
          }),
        }
      );

      if (response.ok) {
        setEditingTaskId(null);
        setEditingTitle("");

        fetchTasks();
      }
    } catch (error) {
      console.log("Update task error:", error);
    }
  };

  // ===============================
  // COMPLETE / UNCOMPLETE TASK
  // ===============================

  const toggleTask = async (task) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            completed: !task.completed,
          }),
        }
      );

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.log("Complete task error:", error);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {
    setLoggedInUser(null);
    setTasks([]);
    setTaskTitle("");
    setMessage("");
  };

  // ===============================
  // TODO DASHBOARD
  // ===============================

  if (loggedInUser) {
    return (
      <div style={styles.container}>
        <div style={styles.dashboard}>

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Todo App</h1>

              <p style={styles.welcome}>
                Welcome, {loggedInUser.name}!
              </p>

              <p style={styles.email}>
                {loggedInUser.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          </div>

          <hr />

          <h2>My Tasks</h2>

          {/* Add Task */}

          <form
            onSubmit={handleAddTask}
            style={styles.addForm}
          >
            <input
              type="text"
              placeholder="Enter a new task"
              value={taskTitle}
              onChange={(e) =>
                setTaskTitle(e.target.value)
              }
              style={styles.taskInput}
            />

            <button
              type="submit"
              style={styles.addButton}
            >
              Add Task
            </button>
          </form>

          {/* Task List */}

          <div style={styles.taskList}>

            {tasks.length === 0 ? (
              <p style={styles.noTasks}>
                No tasks yet. Add your first task!
              </p>
            ) : (
              tasks.map((task) => (

                <div
                  key={task._id}
                  style={styles.taskCard}
                >

                  {editingTaskId === task._id ? (

                    <>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                        style={styles.editInput}
                      />

                      <button
                        onClick={() =>
                          handleUpdateTask(task)
                        }
                        style={styles.saveButton}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditingTitle("");
                        }}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </>

                  ) : (

                    <>
                      <div style={styles.taskLeft}>

                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            toggleTask(task)
                          }
                        />

                        <span
                          style={{
                            ...styles.taskText,
                            textDecoration: task.completed
                              ? "line-through"
                              : "none",
                            color: task.completed
                              ? "#888"
                              : "#222",
                          }}
                        >
                          {task.title}
                        </span>

                      </div>

                      <div>

                        <button
                          onClick={() =>
                            startEdit(task)
                          }
                          style={styles.editButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteTask(task._id)
                          }
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>

                      </div>
                    </>

                  )}

                </div>

              ))
            )}

          </div>

        </div>
      </div>
    );
  }

  // ===============================
  // LOGIN / REGISTER PAGE
  // ===============================

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h1 style={styles.mainTitle}>
          Todo App
        </h1>

        <p style={styles.subtitle}>
          {isLogin
            ? "Login to your account"
            : "Create your account"}
        </p>

        <form
          onSubmit={
            isLogin
              ? handleLogin
              : handleRegister
          }
        >

          {!isLogin && (
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              style={styles.input}
            />
          )}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
          >
            {isLogin ? "Login" : "Register"}
          </button>

        </form>

        {message && (
          <p style={styles.message}>
            {message}
          </p>
        )}

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
            setName("");
            setEmail("");
            setPassword("");
          }}
          style={styles.switchButton}
        >
          {isLogin
            ? "Create New Account"
            : "Already have an account? Login"}
        </button>

      </div>

    </div>
  );
}


// ===============================
// STYLES
// ===============================

const styles = {

  container: {
    minHeight: "100vh",
    padding: "30px 20px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },

  card: {
    width: "400px",
    padding: "35px",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
  },

  mainTitle: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "22px",
    color: "#666",
  },

  input: {
    width: "100%",
    padding: "13px",
    margin: "10px 0",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },

  button: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },

  switchButton: {
    marginTop: "20px",
    background: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "15px",
  },

  message: {
    marginTop: "15px",
    fontSize: "16px",
  },

  dashboard: {
    width: "850px",
    maxWidth: "100%",
    padding: "35px",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  title: {
    margin: "0",
    fontSize: "40px",
  },

  welcome: {
    fontSize: "22px",
    margin: "8px 0",
  },

  email: {
    color: "#666",
    margin: "0",
  },

  logoutButton: {
    padding: "10px 20px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },

  addForm: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "25px",
  },

  taskInput: {
    flex: "1",
    padding: "13px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },

  addButton: {
    padding: "13px 20px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  taskList: {
    marginTop: "20px",
  },

  taskCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    padding: "15px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fafafa",
  },

  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1",
  },

  taskText: {
    fontSize: "17px",
  },

  editButton: {
    padding: "8px 12px",
    marginRight: "5px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  editInput: {
    flex: "1",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },

  saveButton: {
    padding: "8px 12px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "8px 12px",
    background: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  noTasks: {
    textAlign: "center",
    color: "#777",
    padding: "30px",
  },
};

export default App;