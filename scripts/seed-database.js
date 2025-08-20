// scripts/seed-database.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/answarly';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    await db.collection('categories').deleteMany({});
    await db.collection('subcategories').deleteMany({});
    await db.collection('questions').deleteMany({});
    
    // Insert categories
    const categories = [
      { name: 'JavaScript', description: 'JavaScript programming questions' },
      { name: 'TypeScript', description: 'TypeScript programming questions' },
      { name: 'React', description: 'React framework questions' },
      { name: 'Node.js', description: 'Node.js backend questions' },
      { name: 'HTML/CSS', description: 'HTML and CSS questions' }
    ];
    
    const categoryResult = await db.collection('categories').insertMany(categories);
    console.log('Inserted categories:', categoryResult.insertedIds);
    
    // Get category IDs for subcategories
    const jsCategoryId = categoryResult.insertedIds[0];
    const tsCategoryId = categoryResult.insertedIds[1];
    const reactCategoryId = categoryResult.insertedIds[2];
    const nodeCategoryId = categoryResult.insertedIds[3];
    const htmlCategoryId = categoryResult.insertedIds[4];
    
    // Insert subcategories
    const subcategories = [
      { name: 'ES6+ Features', category: jsCategoryId },
      { name: 'DOM Manipulation', category: jsCategoryId },
      { name: 'Async Programming', category: jsCategoryId },
      { name: 'Type System', category: tsCategoryId },
      { name: 'Interfaces', category: tsCategoryId },
      { name: 'Hooks', category: reactCategoryId },
      { name: 'State Management', category: reactCategoryId },
      { name: 'Express.js', category: nodeCategoryId },
      { name: 'Database Integration', category: nodeCategoryId },
      { name: 'Layout', category: htmlCategoryId },
      { name: 'Styling', category: htmlCategoryId }
    ];
    
    const subcategoryResult = await db.collection('subcategories').insertMany(subcategories);
    console.log('Inserted subcategories:', subcategoryResult.insertedIds);
    
    // Insert sample questions
    const questions = [
      {
        text: 'What is the output of console.log(typeof [])?',
        options: ['object', 'array', 'undefined', 'string'],
        correctAnswer: 'object',
        category: jsCategoryId,
        difficulty: 'easy',
        reason: 'In JavaScript, arrays are objects. The typeof operator returns "object" for arrays.'
      },
      {
        text: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        category: jsCategoryId,
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
        category: jsCategoryId,
        subCategory: subcategoryResult.insertedIds[2], // Async Programming
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
        category: tsCategoryId,
        subCategory: subcategoryResult.insertedIds[4], // Interfaces
        difficulty: 'medium',
        reason: 'Interfaces in TypeScript define the structure that an object should have, acting as a contract.'
      },
      {
        text: 'What hook is used to manage state in functional components?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
        category: reactCategoryId,
        subCategory: subcategoryResult.insertedIds[5], // Hooks
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
        category: reactCategoryId,
        subCategory: subcategoryResult.insertedIds[5], // Hooks
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
        category: nodeCategoryId,
        subCategory: subcategoryResult.insertedIds[7], // Express.js
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
        category: htmlCategoryId,
        subCategory: subcategoryResult.insertedIds[10], // Styling
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
        category: jsCategoryId,
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
        category: tsCategoryId,
        subCategory: subcategoryResult.insertedIds[3], // Type System
        difficulty: 'medium',
        reason: 'The type keyword in TypeScript is used to create type aliases and define custom types, making code more readable and maintainable.'
      }
    ];
    
    const questionResult = await db.collection('questions').insertMany(questions);
    console.log('Inserted questions:', questionResult.insertedIds);
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seeding function
seedDatabase();
