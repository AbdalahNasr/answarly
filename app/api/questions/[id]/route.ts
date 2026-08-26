import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Question from '@/server/models/question.model'
import Category from '@/server/models/category.model'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    // Get current user from JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    let user
    try {
      user = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { text, type, difficulty, options, correctAnswer, category, reason, heading, description, media, contentLayout } = body

    // Find the question and check ownership
    const question = await Question.findById(id)
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check if user owns this question
    if (question.createdBy.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate required fields
    if (!text || !type || !difficulty || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate question type specific fields
    if (type === 'multiple_choice') {
      if (!options || options.length < 2) {
        return NextResponse.json(
          { error: 'Multiple choice questions must have at least 2 options' },
          { status: 400 }
        )
      }
      if (!correctAnswer || !options.includes(correctAnswer)) {
        return NextResponse.json(
          { error: 'Correct answer must be one of the provided options' },
          { status: 400 }
        )
      }
    }

    if (type === 'true_false') {
      if (!correctAnswer || !['true', 'false'].includes(correctAnswer)) {
        return NextResponse.json(
          { error: 'True/false questions must have a correct answer of true or false' },
          { status: 400 }
        )
      }
    }

    // Check if category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Update the question with all fields including new media/content layout fields
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        text: text.trim(),
        type,
        difficulty,
        options: type === 'multiple_choice' ? options : undefined,
        correctAnswer: type === 'multiple_choice' || type === 'true_false' ? correctAnswer : undefined,
        category,
        reason: type === 'true_false' ? reason : undefined,
        heading: heading?.trim() || undefined,
        description: description?.trim() || undefined,
        media: media && media.length > 0 ? media : undefined,
        contentLayout: contentLayout || {
          showHeading: true,
          showDescription: true,
          headingPosition: 'before',
          descriptionPosition: 'before'
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category', 'name description')
     .populate('createdBy', 'username email')
     .lean()

    return NextResponse.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    })

  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    // Get current user from JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    let user
    try {
      user = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the question and check ownership
    const question = await Question.findById(id)
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check if user owns this question
    if (question.createdBy.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the question
    await Question.findByIdAndDelete(id)

    return NextResponse.json({
      message: 'Question deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params

    const question = await Question.findById(id)
      .populate('category', 'name description')
      .populate('createdBy', 'username email')
      .lean()

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ question })

  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}
