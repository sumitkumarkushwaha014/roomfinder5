const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'roomfinder.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'available',
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS room_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default admin if not exists
const bcrypt = require('bcryptjs');
const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (!existing) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin_users (username, password) VALUES (?, ?)').run('admin', hash);
}

// Insert default settings
const settingsData = [
  ['company_name', 'Dream Home Finders'],
  ['company_tagline', 'Aapka Perfect Room Dhundhne Mein Hum Hain'],
  ['company_phone', '+91 98765 43210'],
  ['company_email', 'info@dreamhomefinders.com'],
  ['company_address', 'Mumbai, Maharashtra'],
  ['facebook_url', 'https://facebook.com'],
  ['instagram_url', 'https://instagram.com'],
  ['youtube_url', 'https://youtube.com'],
  ['whatsapp_url', 'https://wa.me/919876543210']
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
settingsData.forEach(([k, v]) => insertSetting.run(k, v));

// Insert sample rooms
const roomCount = db.prepare('SELECT COUNT(*) as cnt FROM rooms').get();
if (roomCount.cnt === 0) {
  const insertRoom = db.prepare(`INSERT INTO rooms (title, category, price, location, description, status, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  
  const sampleRooms = [
    ['Spacious Single Room', 'single', 5000, 'Andheri West, Mumbai', 'Sunlit single room with attached bathroom, 24/7 water & electricity. Near metro station.', 'available', 1],
    ['Double Room with Balcony', 'double', 8000, 'Bandra East, Mumbai', 'Beautiful double room with balcony, fully furnished, AC included.', 'available', 1],
    ['1 BHK Apartment', '1bhk', 15000, 'Powai, Mumbai', 'Modern 1 BHK with modular kitchen, parking included. Gated society.', 'available', 1],
    ['2 BHK Family Flat', '2bhk', 22000, 'Thane West', 'Spacious 2 BHK, semi-furnished, 2 balconies, school & hospital nearby.', 'booked', 0],
    ['3 BHK Premium Flat', '3bhk', 35000, 'Juhu, Mumbai', 'Luxury 3 BHK flat, fully furnished, sea view, gym & pool access.', 'available', 1],
  ];
  
  sampleRooms.forEach(r => insertRoom.run(...r));
}

module.exports = db;
