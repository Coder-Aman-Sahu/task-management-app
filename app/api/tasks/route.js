import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get tasks for the user
    const tasks = await db.collection("tasks").find({ userId: authResult.userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title } = await request.json()

    // Validate input
    if (!title) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Create task
    const task = {
      title,
      completed: false,
      userId: authResult.userId,
      createdAt: new Date(),
    }

    const result = await db.collection("tasks").insertOne(task)

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...task,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
