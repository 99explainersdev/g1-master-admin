import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

interface QuizQuery {
  isActive: boolean;
  category?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // traffic_signs, rules_of_road, or null for all
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 means no limit
    const random = searchParams.get("random") === "true"; // For quick quiz

    // --- Database Connection ---
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const quizzesCollection = db.collection("quizzes");

    // Build query
    const query: QuizQuery = { isActive: true };
    
    if (category && ["traffic_signs", "rules_of_road"].includes(category)) {
      query.category = category;
    }

    // Fetch quizzes
    let quizzes;
    
    if (random && limit > 0) {
      // Get random questions for quick quiz
      quizzes = await quizzesCollection
        .aggregate([
          { $match: query },
          { $sample: { size: limit } }
        ])
        .toArray();
    } else {
      // Get all or limited questions
      const cursor = quizzesCollection.find(query).sort({ createdAt: -1 });
      
      if (limit > 0) {
        cursor.limit(limit);
      }
      
      quizzes = await cursor.toArray();
    }

    // Transform _id to id
    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz._id.toString(),
      question: quiz.question,
      options: quiz.options,
      correctAnswerIndex: quiz.correctAnswerIndex,
      explanation: quiz.explanation,
      category: quiz.category,
      imageUrl: quiz.imageUrl || "",
    }));

    return NextResponse.json(
      {
        success: true,
        quizzes: formattedQuizzes,
        count: formattedQuizzes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// Example API calls:
// GET /api/quiz - Get all quizzes
// GET /api/quiz?category=traffic_signs - Get traffic signs quizzes
// GET /api/quiz?category=rules_of_road - Get rules of road quizzes
// GET /api/quiz?random=true&limit=20 - Get 20 random quizzes (quick quiz)