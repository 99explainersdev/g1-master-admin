// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

// Define the User type
interface QuizHistoryEntry {
  score: number;
  totalQuestions: number;
  percentage: number;
  quizType: string;
  date: Date;
}

interface UserStats {
  avgScore: number;
  streak: number;
  totalQuizzes: number;
  completedQuizzes: number;
}

interface User {
  _id: ObjectId;
  stats?: UserStats;
  lastQuizDate?: Date;
  quizHistory?: QuizHistoryEntry[];
  // Add other user fields as needed
}

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret"
    ) as { userId: string };

    // Get request body
    const { score, totalQuestions, quizType } = await request.json();

    if (typeof score !== "number" || typeof totalQuestions !== "number") {
      return NextResponse.json(
        { error: "Invalid data" },
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

    const usersCollection = db.collection<User>("users");

    // Get current user data
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(decoded.userId) 
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate new stats
    const currentStats = user.stats || { 
      avgScore: 0, 
      streak: 0, 
      totalQuizzes: 0,
      completedQuizzes: 0 
    };
    
    const totalQuizzes = currentStats.totalQuizzes + 1;
    const previousTotal = currentStats.avgScore * currentStats.totalQuizzes;
    const scorePercentage = (score / totalQuestions) * 100;
    const newAvgScore = (previousTotal + scorePercentage) / totalQuizzes;

    // Update streak
    const newStreak = scorePercentage >= 80 ? currentStats.streak + 1 : 0;

    // Update user stats
    await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          stats: {
            avgScore: Math.round(newAvgScore),
            streak: newStreak,
            totalQuizzes: totalQuizzes,
            completedQuizzes: currentStats.completedQuizzes + 1,
          },
          lastQuizDate: new Date(),
        },
        $push: {
          quizHistory: {
            score,
            totalQuestions,
            percentage: scorePercentage,
            quizType: quizType || "general",
            date: new Date(),
          }
        }
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Stats updated successfully",
        stats: {
          avgScore: Math.round(newAvgScore),
          streak: newStreak,
          totalQuizzes: totalQuizzes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stats update error:", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}