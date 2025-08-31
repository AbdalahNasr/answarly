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
    const level = searchParams.get('level') || 'all';
    
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
        // If category not found, return empty types
        return NextResponse.json({ types: [], totalQuestions: 0 });
      }
    }
    
    // Add difficulty filter if specified
    if (level && level !== 'all') {
      filter.difficulty = level;
    }
    
    // Get distinct question types and count for this category
    const questionTypes = await Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get total question count
    const totalQuestions = await Question.countDocuments(filter);
    
    // Format the response
    const types = questionTypes.map(item => ({
      type: item._id,
      count: item.count
    }));
    
    return NextResponse.json({ 
      types,
      totalQuestions,
      hasMultipleTypes: types.length > 1
    });
  } catch (error: any) {
    console.error('Error getting question types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
