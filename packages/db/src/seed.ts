import { db } from './client';
import { categories, STARTER_CATEGORIES } from './schema';
import { eq, isNull, and } from 'drizzle-orm';

export async function seedStarterCategories() {
  console.log('Seeding starter categories...');
  
  for (const catName of STARTER_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(and(eq(categories.name, catName), isNull(categories.userId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(categories).values({
        name: catName,
        isPredefined: true,
        userId: null,
      });
      console.log(`+ Seeded category: ${catName}`);
    } else {
      console.log(`= Existing category: ${catName}`);
    }
  }

  console.log('Categories seeded successfully.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedStarterCategories()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
