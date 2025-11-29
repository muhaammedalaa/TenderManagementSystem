#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TMS Frontend...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_BASE_URL=http://localhost:5000

# Development
REACT_APP_DEBUG=true
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm start');
console.log('3. Make sure the backend is running on http://localhost:5000');
console.log('4. Use the seeder controls on the dashboard to populate test data');
console.log('\n🎉 Setup complete!');
