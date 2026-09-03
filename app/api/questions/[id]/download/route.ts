// Download question as .pka file
import { connectToDatabase } from "@/lib/db";
import Question from "@/server/models/question.model";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const question = await Question.findById(params.id).populate("category");

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Build .pka file content
    const pkaContent: any = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      question: {
        _id: question._id.toString(),
        text: question.text,
        heading: question.heading || null,
        description: question.description || null,
        type: question.type,
        category: question.category?.name || null,
        difficulty: question.difficulty,
        options: question.options || [],
        correctAnswer: question.correctAnswer || null,
        keywords: question.keywords || [],
        reason: question.reason || null,
        contentLayout: question.contentLayout || {
          showHeading: true,
          showDescription: true,
          headingPosition: "before",
          descriptionPosition: "before",
        },
        createdAt: question.createdAt,
        createdBy: question.createdBy || null,
      },
      media: [] as any,
    };

    // Process media - convert files to base64
    if (question.media && question.media.length > 0) {
      for (const mediaItem of question.media) {
        try {
          const mediaPath = join(
            process.cwd(),
            "public",
            mediaItem.url.replace(/^\//, "")
          );
          const fileBuffer = await readFile(mediaPath);
          const base64Data = fileBuffer.toString("base64");

          pkaContent.media.push({
            filename: mediaItem.url.split("/").pop(),
            type: mediaItem.type,
            caption: mediaItem.caption || null,
            position: mediaItem.position,
            mimeType:
              mediaItem.type === "gif" ? "image/gif" : "image/jpeg",
            data: base64Data,
          });
        } catch (error) {
          console.error(`Failed to read media file: ${mediaItem.url}`, error);
          // Continue with the rest even if one file fails
        }
      }
    }

    // Send as JSON file with .pka extension
    const jsonString = JSON.stringify(pkaContent, null, 2);
    const filename = `${question._id}-${question.text.substring(0, 20).replace(/\s+/g, "-")}.pka`;

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[download-question] Error:", error);
    return NextResponse.json(
      { error: "Failed to download question" },
      { status: 500 }
    );
  }
}
