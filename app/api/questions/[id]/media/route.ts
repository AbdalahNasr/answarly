// Upload media (images/GIFs) for questions
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const UPLOAD_DIR = join(process.cwd(), "public/uploads/questions");

// Allowed file types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB for GIFs

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const questionId = params.id;
    const questionUploadDir = join(UPLOAD_DIR, questionId);

    // Create directories if they don't exist
    try {
      await mkdir(questionUploadDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create upload directory:", error);
    }

    const uploadedMedia = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: image/jpeg, image/png, image/gif, image/webp` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${i}-${file.name}`;
      const filepath = join(questionUploadDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Determine media type
      const mediaType = file.type === "image/gif" ? "gif" : "image";

      uploadedMedia.push({
        filename,
        url: `/uploads/questions/${questionId}/${filename}`,
        type: mediaType,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }

    return NextResponse.json({ media: uploadedMedia });
  } catch (error) {
    console.error("[media-upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
