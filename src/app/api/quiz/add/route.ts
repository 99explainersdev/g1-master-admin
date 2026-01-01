import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

interface QuizCreationData {
  question: string;
  options: string[]; // Array of 4 options
  correctAnswerIndex: number; // 0, 1, 2, or 3
  explanation: string;
  category: "traffic_signs" | "rules_of_road";
  imageUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body: QuizCreationData = await req.json();
    const {
      question,
      options,
      correctAnswerIndex,
      explanation,
      category,
      imageUrl,
    } = body;

    // --- Basic Validation ---
    if (!question || !question.trim()) {
      return NextResponse.json(
        { message: "Question is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { message: "Exactly 4 options are required." },
        { status: 400 }
      );
    }

    // Check all options are non-empty
    for (let i = 0; i < options.length; i++) {
      if (!options[i] || !options[i].trim()) {
        return NextResponse.json(
          { message: `Option ${i + 1} cannot be empty.` },
          { status: 400 }
        );
      }
    }

    // Validate correct answer index
    if (
      typeof correctAnswerIndex !== "number" ||
      correctAnswerIndex < 0 ||
      correctAnswerIndex > 3
    ) {
      return NextResponse.json(
        { message: "Correct answer index must be 0, 1, 2, or 3." },
        { status: 400 }
      );
    }

    if (!explanation || !explanation.trim()) {
      return NextResponse.json(
        { message: "Explanation is required." },
        { status: 400 }
      );
    }

    if (!category || !["traffic_signs", "rules_of_road"].includes(category)) {
      return NextResponse.json(
        { message: "Category must be either 'traffic_signs' or 'rules_of_road'." },
        { status: 400 }
      );
    }

    // --- Database Connection ---
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { message: "Database connection failed. Please try again later." },
        { status: 500 }
      );
    }

    const quizzesCollection = db.collection("quizzes");

    // --- Prepare Data for Insertion ---
    const newQuizDocument = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswerIndex,
      explanation: explanation.trim(),
      category,
      imageUrl: imageUrl?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true, // Can be used to enable/disable questions
    };

    console.log("Creating new quiz:", newQuizDocument);

    // --- Insert into MongoDB ---
    const result = await quizzesCollection.insertOne(newQuizDocument);

    if (!result.insertedId) {
      return NextResponse.json(
        { message: "Failed to create quiz in the database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Quiz added successfully!",
        quizId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding quiz:", error);

    return NextResponse.json(
      { message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}