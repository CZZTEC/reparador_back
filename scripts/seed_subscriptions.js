/**
 * seed_subscriptions.js
 * Seeds subscription data for test users using Firebase Admin SDK (bypasses rules).
 * Run AFTER emulator is up:
 *   node scripts/seed_subscriptions.js
 */

// Point Admin SDK at the emulator BEFORE initializing
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

const admin = require('../functions/node_modules/firebase-admin');

const PROJECT_ID = 'reparador-de7b5';

// Test professional user that needs an active subscription
const TEST_PROFESSIONAL_UID = 'AAPxuAiCcCrT4SsUJahxSQhblWpn';

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

async function seedSubscription(uid, planType = 'premium') {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.collection('users').doc(uid).set(
    {
      subscription: {
        type: planType,
        status: 'active',
        startedAt: now,
        expiresAt: expiresAt,
        autoRenew: true,
        paymentMethod: 'simulated',
      },
      updatedAt: now,
    },
    { merge: true }
  );

  console.log(`✅ Subscription seeded for ${uid} (plan: ${planType}, expires: ${expiresAt.toLocaleDateString()})`);
}

async function main() {
  console.log('🔥 Seeding subscriptions into emulator...\n');
  await seedSubscription(TEST_PROFESSIONAL_UID, 'premium');
  console.log('\n✅ Seed complete! Test user now has an active subscription.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
