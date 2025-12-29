import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // --- Database Connection ---
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const topicsCollection = db.collection("topics");

    // --- Fetch All Topics ---
    const topics = await topicsCollection
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    // Transform _id to id for easier use in React Native
    const formattedTopics = topics.map((topic) => ({
      id: topic._id.toString(),
      ...topic,
      _id: undefined, // Remove _id from response
    }));

    return NextResponse.json(
      {
        success: true,
        topics: formattedTopics,
        count: formattedTopics.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}