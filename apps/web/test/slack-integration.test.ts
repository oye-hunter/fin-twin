import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { db, users, slackLinks, entries, categories } from '@fin-twin/db';
import { POST as handleEvents } from '../src/app/api/slack/events/route';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

async function runSlackIntegrationTests() {
  console.log('Running Slack Integration Tests...\n');

  // 1. Test URL Verification
  console.log('Test 1: Slack URL verification challenge...');
  const challengeReq = new NextRequest('http://localhost:3000/api/slack/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'url_verification',
      challenge: 'challenge_code_abc123',
    }),
  });

  const challengeRes = await handleEvents(challengeReq);
  const challengeData = await challengeRes.json();
  if (challengeData.challenge !== 'challenge_code_abc123') {
    throw new Error(`Expected challenge code, got: ${JSON.stringify(challengeData)}`);
  }
  console.log('✓ Test 1 passed: URL verification challenge succeeded\n');

  // 2. Setup Test User and Test Link
  console.log('Test 2: Account linking via code...');
  let testUser = (await db.select().from(users).limit(1))[0];
  if (!testUser) {
    const testUserId = `test-user-${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      name: 'Slack Test User',
      email: `test-${Date.now()}@example.com`,
    });
    testUser = (await db.select().from(users).where(eq(users.id, testUserId)))[0];
  }

  const testCode = `FT-999111`;
  const testSlackUserId = `USLACKTEST_${Date.now()}`;

  // Clean up any existing test link
  await db.delete(slackLinks).where(eq(slackLinks.userId, testUser.id));

  // Insert pending link code
  await db.insert(slackLinks).values({
    userId: testUser.id,
    linkCode: testCode,
  });

  // Send message with link code
  const linkReq = new NextRequest('http://localhost:3000/api/slack/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'event_callback',
      event: {
        type: 'message',
        channel: 'D12345',
        user: testSlackUserId,
        text: `Here is my link code: ${testCode}`,
      },
    }),
  });

  const linkRes = await handleEvents(linkReq);
  if (!linkRes.ok) {
    throw new Error(`Link request failed: ${linkRes.status}`);
  }

  // Verify DB updated
  const updatedLink = (
    await db.select().from(slackLinks).where(eq(slackLinks.userId, testUser.id))
  )[0];

  if (updatedLink.slackUserId !== testSlackUserId || updatedLink.linkCode !== null) {
    throw new Error(`Account linking failed: ${JSON.stringify(updatedLink)}`);
  }
  console.log('✓ Test 2 passed: Account linked successfully to Slack user ID\n');

  // 3. Test Inbound Text Dump Parsing
  console.log('Test 3: Inbound text dump parsing...');
  const dumpReq = new NextRequest('http://localhost:3000/api/slack/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'event_callback',
      event: {
        type: 'message',
        channel: 'D12345',
        user: testSlackUserId,
        text: 'Spent $55.00 on fuel yesterday',
      },
    }),
  });

  const dumpRes = await handleEvents(dumpReq);
  if (!dumpRes.ok) {
    throw new Error(`Dump request failed: ${dumpRes.status}`);
  }

  const linkWithPending = (
    await db.select().from(slackLinks).where(eq(slackLinks.userId, testUser.id))
  )[0];

  if (!linkWithPending.pendingDump) {
    throw new Error('Expected pendingDump to be populated with parsed transactions');
  }

  const parsedEntries = JSON.parse(linkWithPending.pendingDump);
  console.log('Parsed pending entries:', parsedEntries);
  if (parsedEntries[0]?.amount !== 55 || parsedEntries[0]?.categoryName !== 'Fuel') {
    throw new Error(`Unexpected parsed entries: ${JSON.stringify(parsedEntries)}`);
  }
  console.log('✓ Test 3 passed: AI Dump parsed and held in pendingDump\n');

  // 4. Test "yes" confirmation & persistence
  console.log('Test 4: Confirmation and database persistence...');
  const confirmReq = new NextRequest('http://localhost:3000/api/slack/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'event_callback',
      event: {
        type: 'message',
        channel: 'D12345',
        user: testSlackUserId,
        text: 'yes',
      },
    }),
  });

  const confirmRes = await handleEvents(confirmReq);
  if (!confirmRes.ok) {
    throw new Error(`Confirm request failed: ${confirmRes.status}`);
  }

  // Verify pendingDump cleared
  const linkAfterConfirm = (
    await db.select().from(slackLinks).where(eq(slackLinks.userId, testUser.id))
  )[0];

  if (linkAfterConfirm.pendingDump !== null) {
    throw new Error('Expected pendingDump to be null after confirmation');
  }

  // Verify entry in database
  const savedEntries = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, testUser.id));

  const saved = savedEntries.find((e) => Number(e.amount) === 55);
  if (!saved) {
    throw new Error('Saved entry not found in entries table');
  }
  console.log('✓ Test 4 passed: Entry persisted to database and pendingDump cleared:', saved);

  // Clean up test link and test entry
  await db.delete(entries).where(eq(entries.id, saved.id));
  await db.delete(slackLinks).where(eq(slackLinks.userId, testUser.id));

  console.log('\n✓ All Slack Integration Tests passed successfully!');
}

runSlackIntegrationTests().catch((err) => {
  console.error('Slack integration test failed:', err);
  process.exit(1);
});
