// test-db.js
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connexion DB réussie !');
    
    // Test une requête simple
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test OK, date serveur:', result.rows[0].now);
    
    // Vérifier les tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Tables trouvées:', tables.rows.length);
    console.log('   -', tables.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    console.log('\n🎉 Tout est OK !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

testConnection();