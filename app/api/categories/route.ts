import { NextRequest, NextResponse } from 'next/server';
import * as CategoryService from '../../../server/services/category.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const parentId = searchParams.get('parentId');
    const tree = searchParams.get('tree');
    
    let categories;
    
    if (tree === 'true') {
      // Return full category tree
      categories = await CategoryService.getCategoryTree();
    } else if (level !== null) {
      // Get categories by level
      categories = await CategoryService.getCategoriesByLevel(parseInt(level));
    } else if (parentId !== null) {
      // Get categories by parent
      categories = await CategoryService.getCategoriesByParent(parentId);
    } else {
      // Get root categories by default
      categories = await CategoryService.getCategoriesByParent();
    }
    
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, parentId } = body;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const category = await CategoryService.createCategory({
      name: name.trim(),
      description: description?.trim(),
      parentId
    });
    
    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    const body = await req.json();
    const { name, description } = body;
    
    const category = await CategoryService.updateCategory(categoryId, {
      name: name?.trim(),
      description: description?.trim()
    });
    
    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    await CategoryService.deleteCategory(categoryId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
