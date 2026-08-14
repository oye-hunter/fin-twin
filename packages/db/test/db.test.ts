import { db, categories, users } from '../src';
import { isNull } from 'drizzle-orm';

async function testDatabase() {
  console.log('Testing Database Connection and Schema...');
  
  // 1. Test basic select on categories
  const catList = await db.select().from(categories).where(isNull(categories.userId));
  console.log(`Found ${catList.length} global categories in DB.`);

  // 2. Test select on users table
  const userList = await db.select().from(users).limit(1);
  console.log(`User query succeeded (count: ${userList.length}).`);

  console.log('✓ Database package verification test passed.');
}

testDatabase().catch((err) => {
  console.error('✗ Database test failed:', err);
  process.exit(1);
});
