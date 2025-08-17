// scripts/migrate-users-to-mongo.js
// Usage (Windows cmd.exe):
// set MONGODB_URI="your_mongo_uri" && node scripts/migrate-users-to-mongo.js

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Please set MONGODB_URI environment variable. Example:');
    console.error('  set MONGODB_URI="mongodb+srv://user:pass@cluster0.mongodb.net/dbname?retryWrites=true&w=majority" && node scripts/migrate-users-to-mongo.js');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_FILE)) {
    console.error('Data file not found:', DATA_FILE);
    process.exit(1);
  }

  let raw;
  try {
    raw = fs.readFileSync(DATA_FILE, 'utf8');
  } catch (err) {
    console.error('Failed to read data file:', err.message);
    process.exit(1);
  }

  let users;
  try {
    users = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(users) || users.length === 0) {
    console.log('No users to migrate.');
    process.exit(0);
  }

  console.log(`Connecting to MongoDB: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;
  const collection = db.collection('users');

  let inserted = 0;
  for (const u of users) {
    try {
      const email = (u.email || '').toLowerCase().trim();
      if (!email) continue;
      const exists = await collection.findOne({ email });
      if (exists) {
        console.log('Skipping existing email:', email);
        continue;
      }

      // Build document. Keep password as-is (assumes hashed in filesystem)
      const doc = {
        username: u.username || u.name || '',
        email,
        password: u.password || null,
        avatarUrl: u.avatarUrl || null,
        role: u.role || 'user',
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
      };

      await collection.insertOne(doc);
      console.log('Inserted:', email);
      inserted++;
    } catch (err) {
      console.error('Error migrating user', u.email, err.message);
    }
  }

  console.log(`Migration complete. Inserted: ${inserted} of ${users.length}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
