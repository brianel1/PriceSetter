const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function setupUser() {
  const username = 'echomedia';
  const password = 'Echomedia@1337';
  
  console.log('Setting up default user...');
  console.log('Username:', username);
  console.log('Password:', password);
  
  try {
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    console.log('\nGenerated hash:', hash);
    
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pricer_setter'
    });
    
    // Check if user exists
    const [existing] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    
    if (existing.length > 0) {
      // Update existing user
      await connection.execute('UPDATE users SET password = ? WHERE username = ?', [hash, username]);
      console.log('\n✓ User password updated successfully!');
    } else {
      // Insert new user
      await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
      console.log('\n✓ User created successfully!');
    }
    
    await connection.end();
    console.log('\nYou can now login with:');
    console.log('  Username: echomedia');
    console.log('  Password: Echomedia@1337');
    
  } catch (error) {
    console.error('\nError:', error.message);
    console.log('\nManual SQL (run in MySQL):');
    const hash = await bcrypt.hash(password, 10);
    console.log(`INSERT INTO users (username, password) VALUES ('${username}', '${hash}');`);
  }
}

setupUser();
