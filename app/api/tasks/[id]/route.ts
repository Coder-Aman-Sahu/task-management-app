import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verify authentication
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find task
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: authResult.userId,
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Get task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verify authentication
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if task exists and belongs to user
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: authResult.userId,
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Update task
    await db.collection("tasks").updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })

    return NextResponse.json({ message: "Task updated successfully" })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verify authentication
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if task exists and belongs to user
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: authResult.userId,
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Delete task
    await db.collection("tasks").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
