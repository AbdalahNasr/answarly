import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import Category from '../../../server/models/category.model';
import SubCategory from '../../../server/models/subcategory.model';
import Question from '../../../server/models/question.model';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Question.deleteMany({});
    
    // Insert categories
    const categories = [
      { name: 'JavaScript', description: 'JavaScript programming questions' },
      { name: 'TypeScript', description: 'TypeScript programming questions' },
      { name: 'React', description: 'React framework questions' },
      { name: 'Node.js', description: 'Node.js backend questions' },
      { name: 'HTML/CSS', description: 'HTML and CSS questions' }
    ];
    
    const categoryDocs = await Category.insertMany(categories);
    console.log('Inserted categories:', categoryDocs.map(c => c._id));
    
    // Insert subcategories
    const subcategories = [
      { name: 'ES6+ Features', category: categoryDocs[0]._id },
      { name: 'DOM Manipulation', category: categoryDocs[0]._id },
      { name: 'Async Programming', category: categoryDocs[0]._id },
      { name: 'Type System', category: categoryDocs[1]._id },
      { name: 'Interfaces', category: categoryDocs[1]._id },
      { name: 'Hooks', category: categoryDocs[2]._id },
      { name: 'State Management', category: categoryDocs[2]._id },
      { name: 'Express.js', category: categoryDocs[3]._id },
      { name: 'Database Integration', category: categoryDocs[3]._id },
      { name: 'Layout', category: categoryDocs[4]._id },
      { name: 'Styling', category: categoryDocs[4]._id }
    ];
    
    const subcategoryDocs = await SubCategory.insertMany(subcategories);
    console.log('Inserted subcategories:', subcategoryDocs.map(s => s._id));
    
    // Insert sample questions
    const questions = [
      {
        text: 'What is the output of console.log(typeof [])?',
        options: ['object', 'array', 'undefined', 'string'],
        correctAnswer: 'object',
        category: categoryDocs[0]._id,
        difficulty: 'easy',
        reason: 'In JavaScript, arrays are objects. The typeof operator returns "object" for arrays.'
      },
      {
        text: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        category: categoryDocs[0]._id,
        difficulty: 'easy',
        reason: 'The push() method adds one or more elements to the end of an array and returns the new length.'
      },
      {
        text: 'What is a Promise in JavaScript?',
        options: [
          'A function that returns immediately',
          'An object representing the eventual completion of an asynchronous operation',
          'A synchronous operation',
          'A type of loop'
        ],
        correctAnswer: 'An object representing the eventual completion of an asynchronous operation',
        category: categoryDocs[0]._id,
        subCategory: subcategoryDocs[2]._id, // Async Programming
        difficulty: 'medium',
        reason: 'A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation.'
      },
      {
        text: 'What is the purpose of the "interface" keyword in TypeScript?',
        options: [
          'To create a new class',
          'To define a contract for object structure',
          'To import modules',
          'To declare variables'
        ],
        correctAnswer: 'To define a contract for object structure',
        category: categoryDocs[1]._id,
        subCategory: subcategoryDocs[4]._id, // Interfaces
        difficulty: 'medium',
        reason: 'Interfaces in TypeScript define the structure that an object should have, acting as a contract.'
      },
      {
        text: 'What hook is used to manage state in functional components?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
        category: categoryDocs[2]._id,
        subCategory: subcategoryDocs[5]._id, // Hooks
        difficulty: 'easy',
        reason: 'useState is the primary hook used to add state to functional components in React.'
      },
      {
        text: 'What is the purpose of useEffect in React?',
        options: [
          'To manage state',
          'To perform side effects in functional components',
          'To create refs',
          'To handle events'
        ],
        correctAnswer: 'To perform side effects in functional components',
        category: categoryDocs[2]._id,
        subCategory: subcategoryDocs[5]._id, // Hooks
        difficulty: 'medium',
        reason: 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.'
      },
      {
        text: 'What is Express.js?',
        options: [
          'A frontend framework',
          'A web application framework for Node.js',
          'A database',
          'A testing library'
        ],
        correctAnswer: 'A web application framework for Node.js',
        category: categoryDocs[3]._id,
        subCategory: subcategoryDocs[7]._id, // Express.js
        difficulty: 'easy',
        reason: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.'
      },
      {
        text: 'What does CSS stand for?',
        options: [
          'Computer Style Sheets',
          'Cascading Style Sheets',
          'Creative Style Sheets',
          'Colorful Style Sheets'
        ],
        correctAnswer: 'Cascading Style Sheets',
        category: categoryDocs[4]._id,
        subCategory: subcategoryDocs[10]._id, // Styling
        difficulty: 'easy',
        reason: 'CSS stands for Cascading Style Sheets, which is a style sheet language used for describing the presentation of a document written in HTML.'
      },
      {
        text: 'What is the difference between let and const in JavaScript?',
        options: [
          'There is no difference',
          'let can be reassigned, const cannot',
          'const can be reassigned, let cannot',
          'let is for functions, const is for variables'
        ],
        correctAnswer: 'let can be reassigned, const cannot',
        category: categoryDocs[0]._id,
        difficulty: 'medium',
        reason: 'let allows you to declare variables that can be reassigned, while const declares variables that cannot be reassigned after initialization.'
      },
      {
        text: 'What is the purpose of the "type" keyword in TypeScript?',
        options: [
          'To create classes',
          'To define custom types and type aliases',
          'To import modules',
          'To declare functions'
        ],
        correctAnswer: 'To define custom types and type aliases',
        category: categoryDocs[1]._id,
        subCategory: subcategoryDocs[3]._id, // Type System
        difficulty: 'medium',
        reason: 'The type keyword in TypeScript is used to create type aliases and define custom types, making code more readable and maintainable.'
      }
    ];
    
    const questionDocs = await Question.insertMany(questions);
    console.log('Inserted questions:', questionDocs.map(q => q._id));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      counts: {
        categories: categoryDocs.length,
        subcategories: subcategoryDocs.length,
        questions: questionDocs.length
      }
    });
    
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
