"use client"

import { useState, useEffect } from "react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import TaskList from "./task-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TaskManagementApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authTab, setAuthTab] = useState("login")

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error("Authentication failed")
        })
        .then((data) => {
          setIsAuthenticated(true)
          setUser(data.user)
        })
        .catch((err) => {
          console.error("Auth verification error:", err)
          localStorage.removeItem("token")
        })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUser(null)
  }

  if (isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Management App</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm">Welcome, {user?.name || "User"}</p>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
        <TaskList />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Task Management App</h1>
      <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm
            onSuccess={(userData) => {
              setIsAuthenticated(true)
              setUser(userData)
            }}
          />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm onSuccess={() => setAuthTab("login")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
