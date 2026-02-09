/**
 * FINANCEQUEST - TEST TRADING SYSTEM
 * Script pour tester le cycle complet de trading
 * 
 * ATTENTION: Ce script nécessite:
 * 1. Un user authentifié
 * 2. Un game créé
 * 3. Données MarketStack en cache
 * 
 * Usage:
 * npx tsx scripts/test-trading.ts
 */

import { db } from '@/lib/db';
import { games, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPrice } from '@/lib/market/prices';

async function testTradingSystem() {
  console.log('🧪 Testing Trading System\n');

  try {
    // 1. Trouver un user de test
    console.log('📊 Step 1: Finding test user...');
    const testUser = await db.query.users.findFirst();

    if (!testUser) {
      console.error('❌ No test user found. Please create a user first.');
      process.exit(1);
    }

    console.log(`✅ Test user: ${testUser.email}\n`);

    // 2. Trouver un game actif
    console.log('📊 Step 2: Finding active game...');
    const activeGame = await db.query.games.findFirst({
      where: eq(games.userId, testUser.id),
    });

    if (!activeGame) {
      console.error('❌ No active game found. Please create a game first.');
      process.exit(1);
    }

    console.log(`✅ Active game: ${activeGame.id}`);
    console.log(`   Start date: ${activeGame.startDate}`);
    console.log(`   Current date: ${activeGame.currentDate}`);
    console.log(`   Balance: ${activeGame.currentBalance}€\n`);

    // 3. Vérifier prix disponibles
    console.log('📊 Step 3: Checking market data...');
    const testSymbol = 'AAPL';
    const priceData = await getPrice(testSymbol, activeGame.currentDate);

    if (!priceData) {
      console.error(`❌ No price data for ${testSymbol} at ${activeGame.currentDate}`);
      process.exit(1);
    }

    console.log(`✅ Market data OK: ${testSymbol} = ${priceData.close_price}€\n`);

    // 4. Instructions pour tests manuels
    console.log('📋 Manual Testing Instructions:\n');

    console.log('1️⃣  BUY Test:');
    console.log(`   POST http://localhost:3000/api/trades/buy`);
    console.log(`   Body: {
     "gameId": "${activeGame.id}",
     "symbol": "AAPL",
     "quantity": 10
   }\n`);

    console.log('2️⃣  SELL Test:');
    console.log(`   POST http://localhost:3000/api/trades/sell`);
    console.log(`   Body: {
     "gameId": "${activeGame.id}",
     "symbol": "AAPL",
     "quantity": 5
   }\n`);

    console.log('3️⃣  SHORT Test (if enabled):');
    console.log(`   POST http://localhost:3000/api/trades/short`);
    console.log(`   Body: {
     "gameId": "${activeGame.id}",
     "symbol": "TSLA",
     "quantity": 5
   }\n`);

    console.log('4️⃣  COVER Test:');
    console.log(`   POST http://localhost:3000/api/trades/cover`);
    console.log(`   Body: {
     "gameId": "${activeGame.id}",
     "symbol": "TSLA",
     "quantity": 5
   }\n`);

    console.log('5️⃣  NEXT DAY Test:');
    console.log(`   POST http://localhost:3000/api/games/next-day`);
    console.log(`   Body: {
     "gameId": "${activeGame.id}"
   }\n`);

    console.log('✅ ✅ ✅ TRADING SYSTEM READY FOR TESTING ✅ ✅ ✅\n');

    console.log('💡 Use Postman, Insomnia, or curl to test the API routes above.');
    console.log('💡 Make sure you include the authentication cookie/header.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

testTradingSystem();
