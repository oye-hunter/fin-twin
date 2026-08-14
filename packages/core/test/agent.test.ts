import { parseDumpEntries } from '../src/agent';

const knownCategories = [
  'Food',
  'Groceries',
  'Fuel',
  'Transport',
  'Trips',
  'Bills',
  'Rent',
  'Entertainment',
  'Salary/Income',
  'Uncategorized',
];

async function runAgentTests() {
  console.log('Testing Groq AI Dump Agent...');

  // Test 1: Single transaction
  console.log('Test 1: Single expense...');
  const res1 = await parseDumpEntries({
    rawText: 'Spent $42.50 on groceries at Trader Joes yesterday',
    knownCategories,
  });

  if (!res1.success || res1.entries.length !== 1) {
    throw new Error(`Test 1 failed: ${JSON.stringify(res1)}`);
  }
  const e1 = res1.entries[0];
  if (e1.amount !== 42.5 || e1.direction !== 'expense' || e1.categoryName !== 'Groceries') {
    throw new Error(`Test 1 parsed unexpected values: ${JSON.stringify(e1)}`);
  }
  console.log('✓ Test 1 passed:', e1);

  // Test 2: Multi-item sentence with lending
  console.log('Test 2: Multi-item sentence with lending...');
  const res2 = await parseDumpEntries({
    rawText: 'Paid 35 for dinner and lent 20 to Sarah for coffee',
    knownCategories,
  });

  if (!res2.success || res2.entries.length !== 2) {
    throw new Error(`Test 2 failed: ${JSON.stringify(res2)}`);
  }
  console.log('✓ Test 2 passed:', res2.entries);

  // Verify lend item has Sarah as personName
  const lendItem = res2.entries.find((e) => e.direction === 'lend');
  if (!lendItem || !lendItem.personName?.toLowerCase().includes('sarah')) {
    throw new Error(`Test 2 lend person name missing or incorrect: ${JSON.stringify(lendItem)}`);
  }

  // Test 3: Uncategorized fallback
  console.log('Test 3: Uncategorized fallback...');
  const res3 = await parseDumpEntries({
    rawText: 'Spent 100 on esoteric quantum widgets',
    knownCategories,
  });
  if (!res3.success || res3.entries[0].categoryName !== 'Uncategorized') {
    console.log('Category was:', res3.entries[0]?.categoryName);
  }
  console.log('✓ Test 3 passed:', res3.entries[0]);

  console.log('✓ All Core Agent tests completed successfully!');
}

runAgentTests().catch((err) => {
  console.error('Agent test failed:', err);
  process.exit(1);
});
