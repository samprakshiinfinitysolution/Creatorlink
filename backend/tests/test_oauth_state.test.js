import assert from 'assert';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Load models and helpers
import InstagramOAuthState from '../src/modules/creator/instagram/instagramOAuthState.model.js';
import { connectTestDatabase } from '../src/config/database.js';

console.log('===============================================================');
console.log('INSTAGRAM OAUTH STATE COMPREHENSIVE TEST SUITE');
console.log('===============================================================');

// 1. Verify Mongoose Schema & Index Deduplication
console.log('\n--- 1. Testing Schema and Index Deduplication ---');
const schema = InstagramOAuthState.schema;
assert.strictEqual(InstagramOAuthState.modelName, 'InstagramOAuthState');
assert.ok(schema.path('creator'), 'creator field missing');
assert.ok(schema.path('nonceHash'), 'nonceHash field missing');
assert.ok(schema.path('expiresAt'), 'expiresAt field missing');
assert.ok(schema.path('isConsumed'), 'isConsumed field missing');
assert.ok(schema.path('consumedAt'), 'consumedAt field missing');

// Verify indexes
const indexes = schema.indexes();
console.log('Declared schema indexes count:', indexes.length);

// Ensure TTL index exists on expiresAt
const ttlIndex = indexes.find(idx => idx[0].expiresAt === 1 && idx[1]?.expireAfterSeconds === 0);
assert.ok(ttlIndex, 'TTL index on expiresAt with expireAfterSeconds: 0 is missing!');
console.log('✓ TTL index on expiresAt with expireAfterSeconds: 0 confirmed.');

// Ensure nonceHash has unique index without redundant declaration
assert.strictEqual(schema.path('nonceHash').options.unique, true, 'nonceHash must be unique');
assert.strictEqual(schema.path('nonceHash').options.index, undefined, 'nonceHash should not have redundant index: true');
assert.strictEqual(schema.path('isConsumed').options.index, undefined, 'isConsumed should not have redundant index: true');
console.log('✓ Redundant indexes removed successfully.');

// Import helper
const { generateOAuthState, consumeOAuthState } = await import('../src/modules/creator/instagram/instagramOAuthState.helper.js');

// 2. Unit Testing Strict Input Validation & Edge Cases
console.log('\n--- 2. Testing Strict Input Validations ---');

const validCreatorId = new mongoose.Types.ObjectId().toString();

// A. Invalid creatorId on generate
await assert.rejects(
    () => generateOAuthState('not_a_valid_id'),
    /Invalid creatorId: creatorId must be a valid MongoDB ObjectId/
);
await assert.rejects(
    () => generateOAuthState(''),
    /creatorId is required/
);
console.log('✓ Invalid creatorId rejected on generation.');

// B. Missing signing secret does NOT create a database record
console.log('Testing: Missing signing secret must not create orphan DB records...');
const originalAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const originalOAuthStateSecret = process.env.OAUTH_STATE_SECRET;

delete process.env.ACCESS_TOKEN_SECRET;
delete process.env.OAUTH_STATE_SECRET;

let orphanCreated = false;
try {
    await generateOAuthState(validCreatorId);
} catch (err) {
    assert.match(err.message, /ACCESS_TOKEN_SECRET is missing/);
    orphanCreated = true;
}
assert.strictEqual(orphanCreated, true, 'Should have thrown error before DB write');
console.log('✓ Missing secret caught before DB operation (no orphan records).');

// Restore secret for subsequent tests
process.env.ACCESS_TOKEN_SECRET = originalAccessTokenSecret || 'mock_secret_for_tests_must_be_long_enough!';

// C. Reject excessively long state strings
const longState = 'a'.repeat(513);
await assert.rejects(
    () => consumeOAuthState(longState),
    /exceeds maximum allowed length/
);
console.log('✓ Excessively long state strings (>512 chars) rejected.');

// D. Malformed payloads
await assert.rejects(
    () => consumeOAuthState('not_base64_json!@@#$'),
    /Malformed OAuth state parameter/
);

const nonObjectJson = Buffer.from(JSON.stringify(['an', 'array']), 'utf8').toString('base64url');
await assert.rejects(
    () => consumeOAuthState(nonObjectJson),
    /state payload must be a JSON object/
);
console.log('✓ Non-object and malformed JSON payloads rejected.');

// E. Invalid payload field formats
const buildStateWithOverride = (overrides) => {
    const rawNonce = crypto.randomBytes(32).toString('hex');
    const exp = Date.now() + 600000;
    const payload = {
        c: validCreatorId,
        n: rawNonce,
        exp,
        ...overrides
    };
    const signingSecret = crypto.createHmac('sha256', process.env.ACCESS_TOKEN_SECRET).update('instagram-oauth-state-signing-key-v1').digest();
    const serialized = `${payload.c}:${payload.n}:${payload.exp}`;
    payload.sig = overrides.sig !== undefined ? overrides.sig : crypto.createHmac('sha256', signingSecret).update(serialized).digest('hex');
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
};

// Invalid creatorId in payload
await assert.rejects(
    () => consumeOAuthState(buildStateWithOverride({ c: 'invalid_id' })),
    /creatorId must be a valid MongoDB ObjectId/
);

// Invalid rawNonce length/format (not 64 hex chars)
await assert.rejects(
    () => consumeOAuthState(buildStateWithOverride({ n: 'tooshort' })),
    /rawNonce must be exactly 64 hexadecimal characters/
);

// Invalid signature format (not 64 hex chars)
await assert.rejects(
    () => consumeOAuthState(buildStateWithOverride({ sig: 'tooshort' })),
    /signature must be exactly 64 hexadecimal characters/
);

// Invalid non-integer expiry
await assert.rejects(
    () => consumeOAuthState(buildStateWithOverride({ exp: '123456789' })),
    /expiresAt must be a valid safe integer timestamp/
);
console.log('✓ All strict field format validations passed.');

// F. Expiry boundary test (now >= expiresAt)
console.log('Testing: Expiry boundary condition (now >= expiresAt)...');
const expiredBoundaryState = buildStateWithOverride({ exp: Date.now() }); // exactly now
await assert.rejects(
    () => consumeOAuthState(expiredBoundaryState),
    /OAuth state has expired/
);

const pastExpiredState = buildStateWithOverride({ exp: Date.now() - 1000 }); // 1 sec ago
await assert.rejects(
    () => consumeOAuthState(pastExpiredState),
    /OAuth state has expired/
);
console.log('✓ Boundary expiry check (>=) passed.');

// 3. Real MongoDB Integration & Concurrency Test
console.log('\n--- 3. Testing Real MongoDB Integration & Concurrency ---');

let testCreatorId;
try {
    await connectTestDatabase();
    console.log('✓ Connected to isolated MongoDB test database for live integration testing');

    testCreatorId = new mongoose.Types.ObjectId();

    // Clean up test records
    await InstagramOAuthState.deleteMany({ creator: testCreatorId });

    // A. Live Generate and Single Consume
    console.log('Testing: Live generation and atomic consumption...');
    const liveState = await generateOAuthState(testCreatorId);
    assert.strictEqual(typeof liveState, 'string');

    // Confirm document exists in real MongoDB
    const decodedLive = JSON.parse(Buffer.from(liveState, 'base64url').toString('utf8'));
    const nonceHash = crypto.createHash('sha256').update(decodedLive.n).digest('hex');
    const dbDocBefore = await InstagramOAuthState.findOne({ nonceHash });
    assert.ok(dbDocBefore, 'State record must exist in MongoDB');
    assert.strictEqual(dbDocBefore.isConsumed, false);

    const consumedResult = await consumeOAuthState(liveState);
    assert.strictEqual(consumedResult.creatorId, testCreatorId.toString());

    const dbDocAfter = await InstagramOAuthState.findOne({ nonceHash });
    assert.strictEqual(dbDocAfter.isConsumed, true);
    assert.ok(dbDocAfter.consumedAt instanceof Date);
    console.log('✓ State successfully persisted and consumed in MongoDB.');

    // B. Replay Protection on real MongoDB
    console.log('Testing: Replay protection on real MongoDB...');
    await assert.rejects(
        () => consumeOAuthState(liveState),
        /replay attack detected/
    );
    console.log('✓ Replay attack blocked on real MongoDB document.');

    // C. Concurrency Test on real MongoDB
    console.log('Testing: Concurrency race condition with multiple simultaneous consumers...');
    const concurrentState = await generateOAuthState(testCreatorId);

    // Launch 5 simultaneous requests attempting to consume the exact same state
    const attempts = await Promise.allSettled([
        consumeOAuthState(concurrentState),
        consumeOAuthState(concurrentState),
        consumeOAuthState(concurrentState),
        consumeOAuthState(concurrentState),
        consumeOAuthState(concurrentState)
    ]);

    const fulfilled = attempts.filter(a => a.status === 'fulfilled');
    const rejected = attempts.filter(a => a.status === 'rejected');

    console.log(`Concurrency Results: ${fulfilled.length} succeeded, ${rejected.length} rejected`);
    assert.strictEqual(fulfilled.length, 1, 'EXACTLY ONE request must succeed in atomic consumption');
    assert.strictEqual(rejected.length, 4, 'ALL other concurrent requests must be rejected');
    
    // Check that all rejected reasons were replay attacks
    for (const rej of rejected) {
        assert.match(rej.reason.message, /replay attack detected/);
    }
    console.log('✓ Real MongoDB atomic concurrency test verified (1 succeeded, 4 rejected with replay error).');

} finally {
    try {
        if (mongoose.connection.readyState === 1 && testCreatorId) {
            await InstagramOAuthState.deleteMany({ creator: testCreatorId });
            console.log('✓ Test records cleaned up in finally block.');
        }
    } catch (cleanupErr) {
        console.error('Warning: Error during test cleanup:', cleanupErr.message);
    }
    await mongoose.disconnect();
    console.log('✓ Disconnected safely from isolated test database.');
}

console.log('\n===============================================================');
console.log('ALL UNIT AND REAL MONGODB CONCURRENCY TESTS PASSED (100%)!');
console.log('===============================================================');
