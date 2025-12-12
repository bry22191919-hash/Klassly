"use client"

import { useState, useEffect } from "react"
import { Plus, Check, Trash2 } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

const API_URL = "http://localhost:5000"

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const res = await fetch(`${API_URL}/api/todos`, { credentials: "include" })
      const data = await res.json()
      if (res.ok) {
        setTodos(data.todos || [])
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo(e) {
    e.preventDefault()
    if (!newTodo.trim()) return

    setAdding(true)
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTodo }),
      })

      if (res.ok) {
        const data = await res.json()
        setTodos([data.todo, ...todos])
        setNewTodo("")
      }
    } catch (error) {
      console.error("Failed to add todo:", error)
    } finally {
      setAdding(false)
    }
  }

  async function toggleTodo(todo) {
    try {
      const res = await fetch(`${API_URL}/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !todo.completed }),
      })

      if (res.ok) {
        setTodos(todos.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)))
      }
    } catch (error) {
      console.error("Failed to update todo:", error)
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  if (loading) {
    return (
      <div className="card todo-card">
        <div className="card-header">
          <h3>To-Do List</h3>
        </div>
        <div className="card-body" style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="card todo-card">
      <div className="card-header">
        <h3>To-Do List</h3>
        <span className="todo-count">{todos.filter((t) => !t.completed).length} pending</span>
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        {/* Add todo form */}
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            className="input"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={adding || !newTodo.trim()}>
            <Plus size={18} />
          </button>
        </form>

        {/* Todo list */}
        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="todo-empty">
              <p>No tasks yet</p>
              <span>Add a task to get started</span>
            </div>
          ) : (
            todos.map((todo, index) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button onClick={() => toggleTodo(todo)} className={`todo-checkbox ${todo.completed ? "checked" : ""}`}>
                  {todo.completed && <Check size={14} />}
                </button>

                <span className="todo-title">{todo.title}</span>

                <button onClick={() => deleteTodo(todo.id)} className="todo-delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
