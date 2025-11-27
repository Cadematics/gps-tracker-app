const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const variables = [
  'SUPABASE_HOST',
  'SUPABASE_USER',
  'SUPABASE_PASSWORD',
  'SUPABASE_DATABASE'
];

let allFound = true;

variables.forEach(v => {
  if (process.env[v]) {
    console.log(`${v} is set.`);
  } else {
    console.log(`${v} is NOT set.`);
    allFound = false;
  }
});

if (allFound) {
  console.log('PASS');
} else {
  console.log('FAIL');
}
