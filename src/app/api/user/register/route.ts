// app/api/user/register/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Create user document (password stored as-is)
    const result = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password, // ❌ no hashing
      name: name.trim(),
      role: "user",
      createdAt: new Date(),
      stats: {
        avgScore: 0,
        streak: 0,
        totalQuizzes: 0,
        completedQuizzes: 0,
      },
      progress: {
        completedTopics: [],
        currentTopic: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
