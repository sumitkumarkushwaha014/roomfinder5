const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'roomfinder-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make session available in views
app.use((req, res, next) => {
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// Routes
app.use('/', require('./routes/main'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`✅ Room Finder Server running at http://localhost:${PORT}`);
  console.log(`📋 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🔑 Default login: admin / admin123`);
});
