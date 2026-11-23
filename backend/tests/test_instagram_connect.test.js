import assert from 'assert';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import mongoose from 'mongoose';

console.log('===============================================================');
console.log('INSTAGRAM CONNECT ENDPOINT TEST SUITE');
console.log('===============================================================');

// 1. Service Layer Verification
console.log('\n--- 1. Testing generateInstagramConnectUrl Service ---');
const { generateInstagramConnectUrl } = await import('../src/modules/creator/instagram/instagram.service.js');
const { consumeOAuthState } = await import('../src/modules/creator/instagram/instagramOAuthState.helper.js');
const InstagramOAuthState = (await import('../src/modules/creator/instagram/instagramOAuthState.model.js')).default;
const Auth = (await import('../src/modules/auth/auth.model.js')).default;
const app = (await import('../src/app.js')).default;
const { generateAccessToken } = await import('../src/utils/helpers/token.helper.js');
import { connectTestDatabase } from '../src/config/database.js';

await connectTestDatabase();
console.log('✓ Connected to isolated MongoDB test database');

const originalAppId = process.env.META_APP_ID;
let server = null;
let testCreatorId = null;
let creatorAuthDoc = null;
let brandAuthDoc = null;

try {
    testCreatorId = new mongoose.Types.ObjectId();

    // Generate connect URL
    const authUrlString = await generateInstagramConnectUrl(testCreatorId);
    assert.strictEqual(typeof authUrlString, 'string');

    const parsedUrl = new URL(authUrlString);
    assert.strictEqual(parsedUrl.origin, 'https://www.facebook.com');
    assert.strictEqual(parsedUrl.pathname, '/dialog/oauth');

    // Check exact query parameters
    assert.strictEqual(parsedUrl.searchParams.get('client_id'), process.env.META_APP_ID);
    assert.strictEqual(parsedUrl.searchParams.get('config_id'), process.env.META_CONFIG_ID);
    assert.strictEqual(parsedUrl.searchParams.get('display'), 'popup');
    assert.strictEqual(parsedUrl.searchParams.get('override_default_response_type'), 'true');
    assert.strictEqual(parsedUrl.searchParams.get('prompt'), 'login');
    assert.strictEqual(parsedUrl.searchParams.get('redirect_uri'), process.env.META_REDIRECT_URI);
    assert.strictEqual(parsedUrl.searchParams.get('response_type'), 'code');

    const stateParam = parsedUrl.searchParams.get('state');
    assert.ok(stateParam, 'state parameter must be present');

    console.log('✓ All 8 query parameters match exact Meta Unified Login requirements.');

    // Verify state returned in URL can be decoded and verified by state helper
    const consumedState = await consumeOAuthState(stateParam);
    assert.strictEqual(consumedState.creatorId, testCreatorId.toString());
    console.log('✓ State parameter in generated URL validated and atomically consumed.');

    // 2. Error handling when creatorId is missing or env vars missing
    console.log('\n--- 2. Testing Service Error Handling ---');
    await assert.rejects(
        () => generateInstagramConnectUrl(null),
        /Creator ID is required/
    );

    try {
        delete process.env.META_APP_ID;
        await assert.rejects(
            () => generateInstagramConnectUrl(testCreatorId),
            /Missing required environment variables/
        );
    } finally {
        process.env.META_APP_ID = originalAppId;
    }
    console.log('✓ Validation and missing environment variable guards passed.');

    // 3. HTTP Route & RBAC Integration via Live Local Express Server
    console.log('\n--- 3. Testing Express App Route & RBAC via HTTP ---');

    // Create mock/temporary creator and brand users in Auth collection for RBAC testing
    creatorAuthDoc = await Auth.create({
        name: 'Instagram Test Creator',
        email: `ig_test_creator_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
    });

    brandAuthDoc = await Auth.create({
        name: 'Instagram Test Brand',
        email: `ig_test_brand_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
    });

    const creatorToken = generateAccessToken({
        userId: creatorAuthDoc._id.toString(),
        role: creatorAuthDoc.role,
        tokenVersion: creatorAuthDoc.passwordVersion || 0
    });

    const brandToken = generateAccessToken({
        userId: brandAuthDoc._id.toString(),
        role: brandAuthDoc.role,
        tokenVersion: brandAuthDoc.passwordVersion || 0
    });

    // Start server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Case A: Unauthenticated request (no cookie) -> 401
    console.log('Testing: Unauthenticated request to /connect...');
    const unauthRes = await fetch(`${baseUrl}/api/creator/instagram/connect`);
    const unauthBody = await unauthRes.json();
    assert.strictEqual(unauthRes.status, 401);
    assert.strictEqual(unauthBody.success, false);
    console.log('✓ 401 Unauthorized returned for unauthenticated request.');

    // Case B: Forbidden request (brand role) -> 403
    console.log('Testing: Forbidden role (brand) request to /connect...');
    const forbiddenRes = await fetch(`${baseUrl}/api/creator/instagram/connect`, {
        headers: {
            Cookie: `accessToken=${brandToken}`
        }
    });
    const forbiddenBody = await forbiddenRes.json();
    assert.strictEqual(forbiddenRes.status, 403);
    assert.strictEqual(forbiddenBody.success, false);
    console.log('✓ 403 Forbidden returned for non-creator role.');

    // Case C: Authenticated creator request -> 200
    console.log('Testing: Authorized creator request to /connect...');
    const authorizedRes = await fetch(`${baseUrl}/api/creator/instagram/connect`, {
        headers: {
            Cookie: `accessToken=${creatorToken}`
        }
    });
    const authorizedBody = await authorizedRes.json();
    assert.strictEqual(authorizedRes.status, 200);
    assert.strictEqual(authorizedBody.success, true);
    assert.strictEqual(authorizedBody.message, 'Instagram authorization URL generated successfully');
    assert.ok(authorizedBody.data?.authUrl, 'Response body must contain data.authUrl');

    const returnedUrl = new URL(authorizedBody.data.authUrl);
    assert.strictEqual(returnedUrl.origin, 'https://www.facebook.com');
    assert.strictEqual(returnedUrl.pathname, '/dialog/oauth');
    assert.strictEqual(returnedUrl.searchParams.get('client_id'), process.env.META_APP_ID);
    assert.strictEqual(returnedUrl.searchParams.get('config_id'), process.env.META_CONFIG_ID);
    assert.strictEqual(returnedUrl.searchParams.get('display'), 'popup');
    assert.strictEqual(returnedUrl.searchParams.get('override_default_response_type'), 'true');
    assert.strictEqual(returnedUrl.searchParams.get('prompt'), 'login');
    assert.strictEqual(returnedUrl.searchParams.get('redirect_uri'), process.env.META_REDIRECT_URI);
    assert.strictEqual(returnedUrl.searchParams.get('response_type'), 'code');
    assert.ok(returnedUrl.searchParams.get('state'), 'state parameter must exist');
    console.log('✓ 200 OK returned with valid authUrl for authenticated creator.');

} finally {
    if (server && server.listening) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (originalAppId !== undefined) {
        process.env.META_APP_ID = originalAppId;
    }
    try {
        if (mongoose.connection.readyState === 1) {
            const creatorIds = [testCreatorId, creatorAuthDoc?._id].filter(Boolean);
            if (creatorIds.length > 0) {
                await InstagramOAuthState.deleteMany({ creator: { $in: creatorIds } });
            }
            const authIds = [creatorAuthDoc?._id, brandAuthDoc?._id].filter(Boolean);
            if (authIds.length > 0) {
                await Auth.deleteMany({ _id: { $in: authIds } });
            }
            console.log('✓ Test records cleaned up in finally block.');
        }
    } catch (cleanupErr) {
        console.error('Warning: Error during test cleanup:', cleanupErr.message);
    }
    await mongoose.disconnect();
}

console.log('\n===============================================================');
console.log('ALL INSTAGRAM CONNECT TESTS PASSED SUCCESSFULLY (100%)!');
console.log('===============================================================');
