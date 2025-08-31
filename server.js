const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage (in a real app, use a database)
let patients = [
  { id: 1, name: 'Sarah Johnson', condition: 'Hypertension', status: 'waiting', appointmentTime: '09:15 AM', doctor: 'Dr. Miller' },
  { id: 2, name: 'Michael Brown', condition: 'Diabetes Type II', status: 'waiting', appointmentTime: '09:30 AM', doctor: 'Dr. Wilson' },
  { id: 3, name: 'Emily Davis', condition: 'Asthma', status: 'in-progress', appointmentTime: '09:45 AM', doctor: 'Dr. Anderson' },
  { id: 4, name: 'Robert Williams', condition: 'Migraine', status: 'completed', appointmentTime: '10:00 AM', doctor: 'Dr. Taylor' }
];

let doctors = [
  { id: 1, name: 'Dr. Miller', specialty: 'Cardiology', available: true },
  { id: 2, name: 'Dr. Wilson', specialty: 'Endocrinology', available: true },
  { id: 3, name: 'Dr. Anderson', specialty: 'Pulmonology', available: false },
  { id: 4, name: 'Dr. Taylor', specialty: 'Neurology', available: true }
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.post('/api/patients', (req, res) => {
  const newPatient = {
    id: patients.length + 1,
    name: req.body.name,
    condition: req.body.condition,
    status: 'waiting',
    appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    doctor: 'Not assigned'
  };
  
  patients.push(newPatient);
  io.emit('patient-added', newPatient);
  res.json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patientIndex = patients.findIndex(p => p.id === id);
  
  if (patientIndex !== -1) {
    patients[patientIndex] = { ...patients[patientIndex], ...req.body };
    io.emit('patient-updated', patients[patientIndex]);
    res.json(patients[patientIndex]);
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

let users = []; // simple in-memory user storage

// Signup route
app.post("/signup", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.json({ success: false, message: "Username exists!" });
    }
    users.push({ username, password });
    req.session.user = { username };
    res.json({ success: true, message: "Signup successful!" });
});

// Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = { username };
        res.json({ success: true, message: "Login successful!" });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// Logout route
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Logged out successfully" });
});

// Session check route
app.get("/check-session", (req, res) => {
    if (req.session.user) res.json({ loggedIn: true });
    else res.json({ loggedIn: false });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
