import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import Category from '../../../../server/models/category.model';
import Question from '../../../../server/models/question.model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    
    // Get categories with question counts, ordered by most questions first
    const trendingCategories = await Category.aggregate([
      {
        $match: { isActive: true, level: 0 } // Only root categories
      },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'category',
          as: 'questions'
        }
      },
      {
        $addFields: {
          questionCount: { $size: '$questions' }
        }
      },
      {
        $sort: { questionCount: -1, name: 1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          questionCount: 1,
          path: 1,
          level: 1
        }
      }
    ]);

    // Transform to match the Topic interface format
    const trendingTopics = trendingCategories.map(cat => ({
      slug: cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: {
        en: cat.name,
        ar: cat.name // For now, using English name for Arabic too
      },
      description: {
        en: cat.description || `${cat.name} questions and answers`,
        ar: cat.description || `${cat.name} أسئلة وإجابات`
      },
      content: {
        en: `Explore ${cat.name} questions and improve your knowledge.`,
        ar: `استكشف أسئلة ${cat.name} وحسّن معرفتك.`
      },
      tags: [cat.name.toLowerCase()],
      questionCount: cat.questionCount,
      categoryId: cat._id
    }));

    return NextResponse.json({ topics: trendingTopics });
  } catch (error: any) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
