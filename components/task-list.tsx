"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Plus, Save, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [editText, setEditText] = useState("")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError("Error loading tasks. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTask }),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      const addedTask = await response.json()
      setTasks([...tasks, addedTask])
      setNewTask("")
    } catch (err) {
      setError("Error adding task. Please try again.")
      console.error(err)
    }
  }

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, completed: !task.completed } : task)))
    } catch (err) {
      setError("Error updating task. Please try again.")
      console.error(err)
    }
  }

  const startEditing = (task) => {
    setEditingTask(task._id)
    setEditText(task.title)
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setEditText("")
  }

  const saveEdit = async (taskId) => {
    if (!editText.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editText }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, title: editText } : task)))
      setEditingTask(null)
    } catch (err) {
      setError("Error updating task. Please try again.")
      console.error(err)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks(tasks.filter((task) => task._id !== taskId))
    } catch (err) {
      setError("Error deleting task. Please try again.")
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={addTask} className="flex items-center space-x-2 mb-6">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            aria-label="New task title"
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {loading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No tasks yet. Add one above!</div>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Task list">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    id={`task-${task._id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task._id, task.completed)}
                    aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
                  />

                  {editingTask === task._id ? (
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                  ) : (
                    <label
                      htmlFor={`task-${task._id}`}
                      className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {editingTask === task._id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => saveEdit(task._id)} aria-label="Save changes">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEditing} aria-label="Cancel editing">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(task)}
                        aria-label={`Edit task "${task.title}"`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTask(task._id)}
                        aria-label={`Delete task "${task.title}"`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
