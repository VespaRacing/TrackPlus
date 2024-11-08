const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const PORT = 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Helper function for missing fields validation
function validateFields(fields, res) {
    const missingFields = fields.filter(field => !field.value);
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing data: ${missingFields.map(f => f.name).join(', ')}` });
    }
    return null;
}

// Create necessary tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS utenti (
            user TEXT PRIMARY KEY,
            pwd TEXT,
            age INTEGER,
            city TEXT,
            email TEXT,
            phone_number TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS piste (
            user TEXT PRIMARY KEY,
            pwd TEXT,
            city TEXT,
            images TEXT,
            reviews TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            name TEXT,
            username TEXT,
            date TEXT,
            tickets_number INTEGER
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
            name TEXT,
            track TEXT,
            username TEXT,
            date TEXT,
            vehicles_number INTEGER
        )
    `);
});


app.post('/registerUser', (req, res) => {
    const { username, password, age, city, email, phone_number } = req.body;

    // Validate fields
    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password },
    { name: 'age', value: age }, { name: 'city', value: city },
    { name: 'email', value: email }, { name: 'phone_number', value: phone_number }], res)) {
        return;
    }

    // Check if user exists
    db.get('SELECT * FROM utenti WHERE user = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            // User exists, return an error message
            return res.status(409).json({ message: 'User already exists' });
        } else {
            // Insert new user
            const stmt = db.prepare('INSERT INTO utenti (user, pwd, age, city, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run([username, password, age, city, email, phone_number], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Error saving user' });
                }

                res.status(201).json({ message: 'Driver profile added successfully' });
            });
            stmt.finalize();
        }
    });
});

app.post('/loginUser', (req, res) => {
    const { username, password } = req.body;

    // Validate fields
    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }], res)) {
        return;
    }

    // Check if user exists
    db.get('SELECT * FROM utenti WHERE user = ? AND pwd = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            // User exists and password matches
            return res.status(200).json(row);
        } else {
            return res.status(404).json({ message: 'User not found or incorrect password' });
        }
    });
});


app.post('/registerTrack', (req, res) => {
    const { username, password, city } = req.body;

    // Validate fields
    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password },
    { name: 'city', value: city }], res)) {
        return;
    }

    // Check if track exists
    db.get('SELECT * FROM piste WHERE user = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            // Track already exists, return an error message
            return res.status(409).json({ message: 'Track already exists' });
        } else {
            // Insert new track
            const stmt = db.prepare('INSERT INTO piste (user, pwd, city, images, reviews) VALUES (?, ?, ?, ?, ?)');
            stmt.run([username, password, city, "", ""], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Error saving the track' });
                }

                res.status(201).json({ username, password, city, images: [], reviews: ["", ""] });
            });
            stmt.finalize();
        }
    });
});

app.post('/loginTrack', (req, res) => {
    const { username, password } = req.body;

    // Validate fields
    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }], res)) {
        return;
    }

    // Check if the user exists and verify password
    db.get('SELECT * FROM piste WHERE user = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Track not found' }); // User not found
        }

        // Verify the password
        if (row.pwd !== password) {
            return res.status(401).json({ message: 'Invalid password' }); // Incorrect password
        }

        // Successful login
        return res.status(200).json({
            username: row.user,
            city: row.city,
            images: row.images ? row.images.split(',') : [],
            reviews: row.reviews ? row.reviews.split(',') : ["", ""]
        });
    });
});

app.get('/getTracks', (req, res) => {
    db.all('SELECT * FROM piste', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        console.log("a")
        console.log(rows)
        res.status(200).json(rows);
    });
});


// Route to delete a track
app.delete('/deleteTrack', (req, res) => {
    const { username, password } = req.body;

    // Validate fields
    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }], res)) {
        return;
    }

    // Delete the track from the database
    const stmt = db.prepare('DELETE FROM piste WHERE user = ? AND pwd = ?');
    stmt.run([username, password], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting the track' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Track not found or incorrect credentials' });
        }

        res.status(200).json({ message: 'Track deleted successfully' });
    });
    stmt.finalize();
});

// Route to book a track
app.post('/bookTrack', (req, res) => {
    const { name, username, date, tickets_number } = req.body;

    // Validate fields
    if (validateFields([{ name: 'name', value: name }, { name: 'username', value: username },
    { name: 'date', value: date }, { name: 'tickets_number', value: tickets_number }], res)) {
        return;
    }

    // Check if track exists
    db.get('SELECT * FROM piste WHERE user = ?', [name], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Track not found' });
        }

        // Insert new booking
        const stmt = db.prepare('INSERT INTO bookings (name, username, date, tickets_number) VALUES (?, ?, ?, ?)');
        stmt.run([name, username, date, tickets_number], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error saving booking' });
            }

            res.status(200).json({ name, status: "ok", date, tickets_number });
        });
        stmt.finalize();
    });
});

app.get('/getVehicles', (req, res) => {
    db.all('SELECT * FROM vehicles', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        console.log("a")
        console.log(rows)
        res.status(200).json(rows);
    });
});

// Route to book a vehicle
app.post('/bookVehicle', (req, res) => {
    const { name, track, username, date, vehicles_number } = req.body;

    // Validate fields
    if (validateFields([{ name: 'name', value: name }, { name: 'track', value: track },
    { name: 'username', value: username }, { name: 'date', value: date },
    { name: 'vehicles_number', value: vehicles_number }], res)) {
        return;
    }

    // Check if track exists
    db.get('SELECT * FROM piste WHERE user = ?', [track], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Track not found' });
        }

        // Insert new vehicle booking
        const stmt = db.prepare('INSERT INTO vehicles (name, track, username, date, vehicles_number) VALUES (?, ?, ?, ?, ?)');
        stmt.run([name, track, username, date, vehicles_number], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error saving vehicle booking' });
            }

            res.status(200).json({
                name: name,
                track: track,
                username: username,
                date: date,
                vehicles_number: vehicles_number
            });
        });
        stmt.finalize();
    });
});

// Route to read all bookings
app.get('/getBookings', (req, res) => {
    db.all('SELECT * FROM bookings', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(200).json(rows);
    });
});

// Route to delete a booking
app.delete('/deleteBooking', (req, res) => {
    const { name, username } = req.body;

    // Validate fields
    if (validateFields([{ name: 'name', value: name }, { name: 'username', value: username }], res)) {
        return;
    }

    const stmt = db.prepare('DELETE FROM bookings WHERE name = ? AND username = ?');
    stmt.run([name, username], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting booking' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    });
    stmt.finalize();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
