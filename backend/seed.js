// Optional helper: creates a few demo users so you can log in immediately.
// Run with: node seed.js
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const User = require('./models/User');

const demoUsers = [
  { name: 'Alice Admin', email: 'admin@approvalflow.com', password: 'password123', role: 'admin', department: 'Administration' },
  { name: 'Bob Approver', email: 'approver1@approvalflow.com', password: 'password123', role: 'approver', department: 'Finance' },
  { name: 'Carla Approver', email: 'approver2@approvalflow.com', password: 'password123', role: 'approver', department: 'Management' },
  { name: 'Dave Employee', email: 'employee@approvalflow.com', password: 'password123', role: 'employee', department: 'Operations' }
];

(async () => {
  await connectDB();
  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created ${u.role}: ${u.email} / password123`);
    } else {
      console.log(`Already exists: ${u.email}`);
    }
  }
  process.exit(0);
})();
