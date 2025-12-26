/**
 * FINANCEQUEST - TEST DB CONNECTION
 * Script pour tester la connexion à la base de données
 */

import { db } from '../lib/db/index';
import { users, games, marketDataCache } from '../lib/db/schema';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test 1: Query simple sur users
    console.log('📊 Test 1: Fetching users table...');
    const usersResult = await db.select().from(users).limit(5);
    console.log(`✅ Found ${usersResult.length} users`);

    // Test 2: Query simple sur games
    console.log('\n📊 Test 2: Fetching games table...');
    const gamesResult = await db.select().from(games).limit(5);
    console.log(`✅ Found ${gamesResult.length} games`);

    // Test 3: Query simple sur market_data_cache
    console.log('\n📊 Test 3: Fetching market_data_cache table...');
    const cacheResult = await db.select().from(marketDataCache).limit(5);
    console.log(`✅ Found ${cacheResult.length} cached records`);

    console.log('\n✅ ✅ ✅ DATABASE CONNECTION SUCCESSFUL ✅ ✅ ✅\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED:', error);
    process.exit(1);
  }
}

testConnection();