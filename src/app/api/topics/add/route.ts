import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

interface StepData {
  title: string;
  desc: string;
}

interface TopicCreationData {
  title: string;
  count: string;
  icon: string;
  color: string;
  iconColor: string;
  tag: string;
  mainSignName: string;
  signImage?: string;
  description: string;
  steps: StepData[];
  commonMistake: string;
  proTip: string;
  legalNote: string;
}

export async function POST(req: Request) {
  try {
    const body: TopicCreationData = await req.json();
    const {
      title,
      count,
      icon,
      color,
      iconColor,
      tag,
      mainSignName,
      signImage,
      description,
      steps,
      commonMistake,
      proTip,
      legalNote,
    } = body;

    // --- Basic Validation ---
    const requiredFields: (keyof TopicCreationData)[] = [
      "title",
      "count",
      "icon",
      "color",
      "iconColor",
      "tag",
      "mainSignName",
      "description",
      "steps",
      "commonMistake",
      "proTip",
      "legalNote",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields
        .map((field) =>
          field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
        )
        .join(", ");
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFieldsMessage}`,
        },
        { status: 400 }
      );
    }

    // Validate steps array
    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { message: "At least one step is required." },
        { status: 400 }
      );
    }

    // Validate each step has title and desc
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].title || !steps[i].desc) {
        return NextResponse.json(
          { message: `Step ${i + 1} is missing title or description.` },
          { status: 400 }
        );
      }
    }

    // --- Database Connection ---
    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        { message: "Database connection failed. Please try again later." },
        { status: 500 }
      );
    }

    const topicsCollection = db.collection("topics");

    // --- Check for Existing Topic (by title) ---
    const existingTopic = await topicsCollection.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") }, // Case-insensitive match
    });

    if (existingTopic) {
      return NextResponse.json(
        { message: "A topic with this title already exists." },
        { status: 409 }
      );
    }

    // --- Prepare Data for Insertion ---
    const newTopicDocument = {
      title,
      count,
      icon,
      color,
      iconColor,
      tag,
      mainSignName,
      signImage: signImage || "",
      description,
      steps,
      commonMistake,
      proTip,
      legalNote,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating new topic:", newTopicDocument);

    // --- Insert into MongoDB ---
    const result = await topicsCollection.insertOne(newTopicDocument);

    if (!result.insertedId) {
      return NextResponse.json(
        { message: "Failed to create topic in the database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Topic added successfully!",
        topicId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding topic:", error);

    // More specific error for duplicate key
    interface MongoError extends Error {
      code?: number;
    }

    function isMongoDuplicateKeyError(err: unknown): err is MongoError {
      return (
        err instanceof Error &&
        typeof (err as MongoError).code === "number" &&
        (err as MongoError).code === 11000
      );
    }

    if (isMongoDuplicateKeyError(error)) {
      return NextResponse.json(
        { message: "A topic with this title already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}