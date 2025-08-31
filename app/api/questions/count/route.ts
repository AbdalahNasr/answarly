import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import Question from '../../../../server/models/question.model';
import Category from '../../../../server/models/category.model';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type') || 'multiple_choice';
    const level = searchParams.get('level') || 'medium';
    
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Build filter object
    const filter: any = {};
    
    // Handle category filtering
    if (Types.ObjectId.isValid(category)) {
      // If it's a valid ObjectId, use it directly
      filter.category = category;
    } else {
      // If not a valid ObjectId, treat as category name
      // Find category by name
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(category, 'i') }, 
        isActive: true 
      }).lean();
      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // If category not found, return 0 questions
        return NextResponse.json({ count: 0 });
      }
    }
    
    // Add type filter if specified
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // Add difficulty filter if specified
    if (level && level !== 'all') {
      filter.difficulty = level;
    }
    
    // Count questions matching the filter
    const count = await Question.countDocuments(filter);
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error counting questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
