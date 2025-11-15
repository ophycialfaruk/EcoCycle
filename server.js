// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'progress.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure progress.json exists
if (!fs.existsSync(DATA_FILE)) {
  const initData = {
    users: {},
    requests: [],
    feedback: [],
    admin: { email: "admin@ecocycle.com", password: "admin" }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initData, null, 2), 'utf8');
}

// Helpers
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading progress.json:', err);
    return { users: {}, requests: [], feedback: [], admin: {} };
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// -------------------- USER ROUTES --------------------
// Register
app.post('/api/user/register', (req, res) => {
  const { name, email, password, address, state, country, contact } = req.body;
  if (!name || !email || !password || !address || !state || !country || !contact)
    return res.status(400).json({ error: "All fields required" });
  
  const data = readData();
  if (Object.values(data.users).some(u => u.email === email))
    return res.status(400).json({ error: "Email already registered" });
  
  const id = nanoid(6);
  data.users[id] = { id, name, email, password, address, state, country, contact };
  writeData(data);
  res.json({ message: "Registered successfully", id });
});

// Login
app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();
  const user = Object.values(data.users).find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  res.json(user);
});

// Submit Waste Request
app.post('/api/user/request', (req, res) => {
  const { userId, type, kg } = req.body;
  if (!userId || !type || kg == null) return res.status(400).json({ error: "Missing data" });
  const data = readData();
  const user = data.users[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  const request = { 
    id: nanoid(6), userId, type, kg, status: "pending", 
    amount: 0, date: new Date().toLocaleDateString(), accomplished: false 
  };
  data.requests.push(request);
  writeData(data);
  res.json(request);
});

// Feedback
app.post('/api/user/feedback', (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: "Missing feedback" });
  const data = readData();
  data.feedback.push({ id: nanoid(6), userId, text, date: new Date().toLocaleDateString() });
  writeData(data);
  res.json({ message: "Feedback submitted" });
});

// Get user's requests
app.get('/api/user/requests/:userId', (req, res) => {
  const data = readData();
  const requests = data.requests.filter(r => r.userId === req.params.userId);
  res.json(requests);
});

// Get user's feedback
app.get('/api/user/feedback/:userId', (req, res) => {
  const data = readData();
  const feedbacks = data.feedback.filter(f => f.userId === req.params.userId);
  res.json(feedbacks);
});

// -------------------- ADMIN ROUTES --------------------
// Get all requests
app.get('/api/admin/requests', (req, res) => res.json(readData().requests));

// Get all feedback
app.get('/api/admin/feedback', (req, res) => res.json(readData().feedback));

// Reply to feedback
app.post('/api/admin/feedback/reply', (req, res) => {
  const { feedbackId, reply } = req.body;
  if (!feedbackId || !reply) return res.status(400).json({ error: "Missing data" });

  const data = readData();
  const fb = data.feedback.find(f => f.id === feedbackId);
  if (!fb) return res.status(404).json({ error: "Feedback not found" });

  fb.reply = reply;
  writeData(data);
  res.json({ message: "Reply saved", feedback: fb });
});

// Update request
app.post('/api/admin/request/update', (req, res) => {
  const { requestId, status, amount, accomplished } = req.body;
  const data = readData();
  const reqItem = data.requests.find(r => r.id === requestId);
  if (!reqItem) return res.status(404).json({ error: "Request not found" });

  if (status) {
    reqItem.status = status;
    if (status === "approved" && amount != null) reqItem.amount = amount;
  }
  if (accomplished !== undefined) reqItem.accomplished = !!accomplished;

  writeData(data);
  res.json(reqItem);
});

// Get all users
app.get('/api/admin/users', (req, res) => res.json(readData().users));

// Delete user
app.post('/api/admin/user/delete', (req, res) => {
  const { userId } = req.body;
  const data = readData();
  if (!data.users[userId]) return res.status(404).json({ error: "User not found" });
  delete data.users[userId];
  data.requests = data.requests.filter(r => r.userId !== userId);
  data.feedback = data.feedback.filter(f => f.userId !== userId);
  writeData(data);
  res.json({ message: "User deleted" });
});

// Update user
app.post('/api/admin/user/update', (req, res) => {
  const { userId, updates } = req.body;
  const data = readData();
  const user = data.users[userId];
  if (!user) return res.status(404).json({ error: "User not found" });
  const allowed = ['name', 'contact', 'address', 'state', 'country'];
  allowed.forEach(k => { if (updates[k] !== undefined) user[k] = updates[k]; });
  writeData(data);
  res.json({ message: "User updated", user });
});

// Catch-all API 404
app.use('/api/*', (req, res) => res.status(404).json({ error: "API endpoint not found" }));

// Serve index.html
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Start server
app.listen(PORT, () => console.log(`EcoCycle running at port ${PORT}`));
