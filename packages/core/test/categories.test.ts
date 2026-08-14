import { matchCategory } from '../src/categories';

const categories = [
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

function runCategoryTests() {
  console.log('Running Category Matcher tests...');

  // Exact match
  if (matchCategory('Food', categories) !== 'Food') throw new Error('Failed exact match');
  
  // Case insensitive match
  if (matchCategory('groceries', categories) !== 'Groceries') throw new Error('Failed case-insensitive match');
  if (matchCategory('RENT', categories) !== 'Rent') throw new Error('Failed uppercase match');
  
  // Unknown category fallback
  if (matchCategory('Spaceship Repair', categories) !== 'Uncategorized') throw new Error('Failed unknown category fallback');
  if (matchCategory('', categories) !== 'Uncategorized') throw new Error('Failed empty category fallback');
  if (matchCategory(null, categories) !== 'Uncategorized') throw new Error('Failed null category fallback');

  console.log('✓ Category matcher tests passed.');
}

runCategoryTests();
