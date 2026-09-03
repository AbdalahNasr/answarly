import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Question from '@/server/models/question.model'
import Category from '@/server/models/category.model'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const myQuestions = searchParams.get('myQuestions')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
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

    if (!user?.id && !user?.userId && !user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id || user.userId || user._id
    
    let query: any = {}
    
    // If requesting user's own questions
    if (myQuestions === 'true') {
      query.createdBy = userId
    }
    
    // Apply filters
    if (category) {
      query.category = category
    }
    
    if (difficulty) {
      query.difficulty = difficulty
    }
    
    if (type) {
      query.type = type
    }
    
    const skip = (page - 1) * limit
    
    const questions = await Question.find(query)
      .populate('category', 'name description')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Question.countDocuments(query)
    
    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!user?.id && !user?.userId && !user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id || user.userId || user._id
    
    const body = await request.json()
    const { 
      text, family, type, difficulty, options, correctAnswer, keywords, category, 
      reason, heading, description, media, contentLayout,
      audioUrl, listeningAnswerFormat, blankTemplate, blankAnswers, 
      matchPairs, orderItems, latex, diagramLabels 
    } = body
    
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
    
    if (type === 'open_ended') {
      if (!correctAnswer || correctAnswer.trim() === '') {
        return NextResponse.json(
          { error: 'Open-ended questions must have a correct answer' },
          { status: 400 }
        )
      }
    }

    if (type === 'listening') {
      if (!audioUrl) {
        return NextResponse.json({ error: 'Listening questions must have an audio URL' }, { status: 400 })
      }
      if (listeningAnswerFormat === 'mcq' && (!options || options.length < 2)) {
        return NextResponse.json({ error: 'Listening MCQ questions must have at least 2 options' }, { status: 400 })
      }
    }

    if (type === 'fill_in_blank') {
      if (!blankTemplate || !blankAnswers || blankAnswers.length === 0) {
        return NextResponse.json({ error: 'Fill-in-the-blank questions must have a template and answers' }, { status: 400 })
      }
    }

    if (type === 'match_pairs') {
      if (!matchPairs || matchPairs.length < 2) {
        return NextResponse.json({ error: 'Match pairs questions must have at least 2 pairs' }, { status: 400 })
      }
    }

    if (type === 'ordering') {
      if (!orderItems || orderItems.length < 2) {
        return NextResponse.json({ error: 'Ordering questions must have at least 2 items' }, { status: 400 })
      }
    }

    if (type === 'math_equation') {
      if (!latex || !correctAnswer) {
        return NextResponse.json({ error: 'Math questions must have a LaTeX equation and correct answer' }, { status: 400 })
      }
    }

    if (type === 'graph_chart' || type === 'image_mcq' || type === 'diagram_label') {
      if (!media || media.length === 0) {
        return NextResponse.json({ error: `${type} questions must have at least one image/media` }, { status: 400 })
      }
    }

    if (type === 'diagram_label') {
      if (!diagramLabels || diagramLabels.length === 0) {
        return NextResponse.json({ error: 'Diagram label questions must have at least one label' }, { status: 400 })
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
    
    const question = new Question({
      text: text.trim(),
      family: family || (['multiple_choice', 'true_false', 'image_mcq'].includes(type) ? 'choice' : ['open_ended', 'math_equation'].includes(type) ? 'text' : ['fill_in_blank', 'match_pairs', 'ordering'].includes(type) ? 'structured' : ['diagram_label', 'drawio_studio'].includes(type) ? 'visual' : 'media'),
      type,
      difficulty,
      options: (type === 'multiple_choice' || type === 'listening' || type === 'image_mcq') ? options : undefined,
      correctAnswer: (type === 'multiple_choice' || type === 'true_false' || type === 'open_ended' || type === 'listening' || type === 'math_equation' || type === 'graph_chart' || type === 'image_mcq') ? correctAnswer : undefined,
      keywords: type === 'open_ended' && keywords && keywords.length > 0 ? keywords : undefined,
      category,
      reason: (type === 'true_false' || reason) ? reason : undefined,
      createdBy: userId,
      heading: heading?.trim() || undefined,
      description: description?.trim() || undefined,
      media: media && media.length > 0 ? media : undefined,
      contentLayout: contentLayout || {
        showHeading: true,
        showDescription: true,
        headingPosition: 'before',
        descriptionPosition: 'before'
      },
      audioUrl,
      listeningAnswerFormat,
      blankTemplate,
      blankAnswers,
      matchPairs,
      orderItems,
      latex,
      diagramLabels
    })
    
    await question.save()
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('category', 'name description')
      .populate('createdBy', 'username email')
      .lean()
    
    return NextResponse.json({
      message: 'Question created successfully',
      question: populatedQuestion
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating question:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
	return QController.updateQuestion(req);
}

export async function DELETE(req: NextRequest) {
	return QController.deleteQuestion(req);
}
