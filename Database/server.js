const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const PORT = 4000;
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../FrontEnd')));

app.use(cors());

require('dotenv').config();

const session = require('express-session');

app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.get('/session', (req, res) => {
    console.log(req.session.loggedin)
    if (!req.session.loggedin) {
        return res.status(401).json({ message: 'Not logged in' });
    }
    res.send('User is logged in');
});

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

function validateFields(fields, res) {
    const missingFields = fields.filter(field => !field.value);
    if (missingFields.length > 0) {
        return res.status(400).json({ message: 'Missing data', missingFields: missingFields.map(f => f.name).join(', ') });
    }
    return null;
}

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS utenti (
            user TEXT PRIMARY KEY,
            pwd TEXT,
            age INTEGER,
            city TEXT,
            email TEXT,
            phone_number TEXT,
            role TEXT
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

    db.get('SELECT COUNT(*) AS count FROM utenti', (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        if (row.count === 0) {
            db.run(`
                INSERT INTO utenti (user, pwd, age, city, email, phone_number, role) VALUES
                ('admin', 'admin', 25, 'New York', 'admin@gmail.com', '1234567890', 'admin'),
                ('sd', 'sd', 30, 'Los Angeles', 'sd@gmail.com', '0987654321', 'user')
            `, (err) => {
                if (err) {
                    console.error('Error inserting data:', err);
                } else {
                    console.log('Data inserted successfully');
                }
            });
        } else {
            console.log('Table not empty');
        }
    });

    db.get('SELECT COUNT(*) AS count FROM piste', (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        if (row.count === 0) {
            db.run(`
                INSERT INTO piste (user, pwd, city, images, reviews) VALUES
                ('monza', 'monza', 'monza', '', ''),
                ('roma', 'roma', 'roma', '', '')
            `, (err) => {
                if (err) {
                    console.error('Error inserting data:', err);
                } else {
                    console.log('Data inserted successfully');
                }
            });
        } else {
            console.log('Table not empty');
        }
    });
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sourceMapsEnabled = require('process');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Track Management API',
            version: '1.0.0',
            description: 'API for managing tracks, users, bookings, and vehicles',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
 * @swagger
 * /registerUser:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - age
 *               - city
 *               - email
 *               - phone_number
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *               age:
 *                 type: integer
 *                 description: The age of the user.
 *               city:
 *                 type: string
 *                 description: The city of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phone_number:
 *                 type: string
 *                 description: The phone number of the user.
 *     responses:
 *       201:
 *         description: User successfully registered.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */



app.post('/registerUser', (req, res) => {
    const { username, password, age, city, email, phone_number } = req.body;

    if (
        validateFields(
            [
                { name: 'username', value: username },
                { name: 'password', value: password },
                { name: 'age', value: age },
                { name: 'city', value: city },
                { name: 'email', value: email },
                { name: 'phone_number', value: phone_number }
            ],
            res
        )
    ) {
        return;
    }

    db.get('SELECT * FROM utenti WHERE user = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            return res.status(409).json({ message: 'User already exists' });
        } else {
            const stmt = db.prepare(
                'INSERT INTO utenti (user, pwd, age, city, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)'
            );
            stmt.run([username, password, age, city, email, phone_number], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Error saving user' });
                }

                res.status(201).json({ message: 'Driver profile added successfully' });
            });

            stmt.finalize();
        }
    });
});


/**
 * @swagger
 * /loginUser:
 *   post:
 *     summary: Authenticate a user and retrieve their details
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       200:
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the authenticated user.
 *                 age:
 *                   type: integer
 *                   description: The age of the authenticated user.
 *                 city:
 *                   type: string
 *                   description: The city of the authenticated user.
 *                 email:
 *                   type: string
 *                   description: The email address of the authenticated user.
 *                 phone_number:
 *                   type: string
 *                   description: The phone number of the authenticated user.
 *                 role:
 *                   type: string
 *                   description: The role of the authenticated user.
 *       404:
 *         description: User not found or incorrect password.
 *       500:
 *         description: Internal server error.
 */



app.post('/loginUser', (req, res) => {
    const { username, password } = req.body;

    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }], res)) {
        return;
    }

    db.get('SELECT * FROM utenti WHERE user = ? AND pwd = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (row) {
            res.status(200).json({
                username: row.user,
                age: row.age,
                city: row.city,
                email: row.email,
                phone_number: row.phone_number,
                role: row.role
            });
        } else {
            res.status(404).json({ message: 'User not found or incorrect password' });
        }
    });
});



/**
 * @swagger
 * /registerTrack:
 *   post:
 *     summary: Register a new track
 *     tags:
 *       - Tracks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - city
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the track owner.
 *               password:
 *                 type: string
 *                 description: The password for track owner authentication.
 *               city:
 *                 type: string
 *                 description: The city where the track is located.
 *     responses:
 *       201:
 *         description: Track registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the track owner.
 *                 password:
 *                   type: string
 *                   description: The password of the track owner.
 *                 city:
 *                   type: string
 *                   description: The city of the track.
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of images for the track (currently empty).
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of reviews for the track (currently empty).
 *       409:
 *         description: Track already exists.
 *       500:
 *         description: Database error or error saving the track.
 */



app.post('/registerTrack', (req, res) => {
    const { username, password, city } = req.body;

    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }, { name: 'city', value: city }], res)) {
        return;
    }

    db.get('SELECT * FROM piste WHERE user = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            return res.status(409).json({ message: 'Track already exists' });
        } else {
            const stmt = db.prepare('INSERT INTO piste (user, pwd, city, images, reviews) VALUES (?, ?, ?, ?, ?)');
            stmt.run([username, password, city, "", ""], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Error saving the track' });
                }

                res.status(201).json({ username, password, city, images: [], reviews: ["", ""] });
            });

            stmt.finalize();

            io.emit('updateTracks', { message: 'A new track was registered!' });
        }
    });
});


io.on('connection', (socket) => {
    console.log('A client connected');

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});



/**
 * @swagger
 * /loginTrack:
 *   post:
 *     summary: Authenticate a track and retrieve its details
 *     tags:
 *       - Tracks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the track.
 *               password:
 *                 type: string
 *                 description: The password for the track.
 *     responses:
 *       200:
 *         description: Track authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 track:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       description: The username of the track.
 *                     city:
 *                       type: string
 *                       description: The city where the track is located.
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: A list of images associated with the track.
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: A list of reviews for the track.
 *       404:
 *         description: Track not found or incorrect password.
 *       500:
 *         description: Database error.
 */


app.post('/loginTrack', (req, res) => {
    const { username, password } = req.body;

    if (validateFields([{ name: 'username', value: username }, { name: 'password', value: password }], res)) {
        return;
    }

    db.get('SELECT * FROM piste WHERE user = ? AND pwd = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (row) {
            req.session.track = {
                username: row.user,
                city: row.city,
                images: row.images ? row.images.split(',') : [],
                reviews: row.reviews ? row.reviews.split(',') : [],
            };

            res.status(200).json({ message: 'Login successful', track: req.session.track });
        } else {
            res.status(404).json({ message: 'Track not found or incorrect password' });
        }
    });
});



/**
 * @swagger
 * /getTracks:
 *   get:
 *     summary: Retrieve track information
 *     tags:
 *       - Tracks
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: false
 *         description: The username to filter tracks. If not specified, all tracks are returned.
 *     responses:
 *       200:
 *         description: Tracks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                     description: The username associated with the track.
 *                   pwd:
 *                     type: string
 *                     description: The password for the track (usually not returned for security).
 *                   city:
 *                     type: string
 *                     description: The city where the track is located.
 *                   images:
 *                     type: string
 *                     description: Comma-separated image paths for the track.
 *                   reviews:
 *                     type: string
 *                     description: Comma-separated reviews for the track.
 *       404:
 *         description: No tracks found.
 *       500:
 *         description: Database error.
 */



app.get('/getTracks', (req, res) => {
    const { username } = req.query;

    console.log("init");

    if (username) {
        db.all('SELECT * FROM piste WHERE user = ?', [username], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'No tracks found for the specified name' });
            }

            res.status(200).json(rows);
        });
    } else {
        console.log("username not specified");
        db.all('SELECT * FROM piste', (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'No tracks found' });
            }

            res.status(200).json(rows);
        });
    }
});



/**
 * @swagger
 * /getUsers:
 *   get:
 *     summary: Retrieve all registered users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                     description: The username of the user.
 *                   pwd:
 *                     type: string
 *                     description: The password of the user (usually not returned for security).
 *                   age:
 *                     type: integer
 *                     description: The age of the user.
 *                   city:
 *                     type: string
 *                     description: The city where the user resides.
 *                   email:
 *                     type: string
 *                     description: The email address of the user.
 *                   phone_number:
 *                     type: string
 *                     description: The phone number of the user.
 *       500:
 *         description: Database error.
 */



app.get('/getUsers', (req, res) => {
    db.all('SELECT * FROM utenti', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(200).json(rows);
    });
});




/**
 * @swagger
 * /getWeather:
 *   get:
 *     summary: Fetch weather information for a specified location
 *     tags:
 *       - Weather
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the location to retrieve weather information for.
 *     responses:
 *       200:
 *         description: Weather information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: string
 *                   description: The name of the location.
 *                 temperature:
 *                   type: number
 *                   description: The current temperature in Celsius.
 *                 condition:
 *                   type: string
 *                   description: The weather condition description.
 *                 icon:
 *                   type: string
 *                   description: The URL of the weather condition icon.
 *       404:
 *         description: Location not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the location was not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an internal server issue.
 */


app.get("/getWeather", async (req, res) => {
    const { location } = req.query;

    if (!location) {
        return res.status(404).json({ message: "Città Non Trovata" });
    }

    try {
        console.log(`http://api.weatherapi.com/v1/current.json?key=${process.env.APIKEY}&q=${location}&aqi=no`)
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.APIKEY}&q=${location}&aqi=no`);

        if (!response.ok) {
            return res.status(response.status).json({
                message: "Errore nel recupero dei dati meteo",
                error: response.statusText,
            });
        }

        const weatherData = await response.json();

        return res.status(200).json({
            location: weatherData.location.name,
            temperature: weatherData.current.temp_c,
            condition: weatherData.current.condition.text,
            icon: weatherData.current.condition.icon,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server" });
    }
});



/**
 * @swagger
 * /getFiltredTracks:
 *   get:
 *     summary: Retrieve tracks filtered by username
 *     tags:
 *       - Tracks
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username to filter tracks by.
 *     responses:
 *       200:
 *         description: Filtered tracks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                     description: The username associated with the track.
 *                   pwd:
 *                     type: string
 *                     description: The password associated with the track (usually not returned for security).
 *                   city:
 *                     type: string
 *                     description: The city where the track is located.
 *                   images:
 *                     type: string
 *                     description: Comma-separated URLs for images of the track.
 *                   reviews:
 *                     type: string
 *                     description: Comma-separated reviews of the track.
 *       400:
 *         description: Missing username query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the required parameter is missing.
 *       404:
 *         description: No tracks found for the specified username.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating no tracks were found.
 *       500:
 *         description: Internal database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating a server error.
 */



app.get('/getFiltredTracks', (req, res) => {
    const { username } = req.query;

    console.log("inizio");

    if (!username) {
        return res.status(400).json({ message: 'Name parameter is required' });
    }

    db.all('SELECT * FROM piste WHERE user = ?', [username], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No tracks found for the specified name' });
        }

        res.status(200).json(rows);
    });
});




/**
 * @swagger
 * /deleteTrack:
 *   delete:
 *     summary: Delete a track by username
 *     tags:
 *       - Tracks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the track to delete.
 *                 example: "trackUsername123"
 *     responses:
 *       200:
 *         description: Track deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       404:
 *         description: Track not found or incorrect credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the track was not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating a server error occurred.
 */


app.delete('/deleteTrack', (req, res) => {
    const { username } = req.body;

    if (validateFields([{ name: 'username', value: username }], res)) {
        return;
    }

    const stmt = db.prepare('DELETE FROM piste WHERE user = ?');

    stmt.run([username], function (err) {
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




/**
 * @swagger
 * /deleteUser:
 *   delete:
 *     summary: Delete a user by username
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to delete.
 *         example: "user123"
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       404:
 *         description: User not found or incorrect credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user was not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating a server error occurred.
 */



app.delete('/deleteUser', (req, res) => {
    const { username } = req.query;

    console.log(username);

    if (validateFields([{ name: 'username', value: username }], res)) {
        return;
    }

    const stmt = db.prepare('DELETE FROM utenti WHERE user = ?');

    stmt.run([username], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting the user' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found or incorrect credentials' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    });

    stmt.finalize();
});



/**
 * @swagger
 * /bookTrack:
 *   post:
 *     summary: Book a track for a user
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the track to book.
 *                 example: "Mountain Track"
 *               username:
 *                 type: string
 *                 description: The username of the person making the booking.
 *                 example: "user123"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date for the booking.
 *                 example: "2024-12-25"
 *               tickets_number:
 *                 type: integer
 *                 description: The number of tickets being booked.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the track.
 *                 status:
 *                   type: string
 *                   description: Booking status.
 *                 date:
 *                   type: string
 *                   description: The booking date.
 *                 tickets_number:
 *                   type: integer
 *                   description: The number of tickets booked.
 *       400:
 *         description: Bad request. Missing required fields or validation failure.
 *       404:
 *         description: Track not found.
 *       500:
 *         description: Internal server error while saving booking.
 */


app.post('/bookTrack', (req, res) => {
    const { name, username, date, tickets_number } = req.body;

    if (validateFields([{ name: 'name', value: name }, { name: 'username', value: username }, { name: 'date', value: date }, { name: 'tickets_number', value: tickets_number }], res)) {
        return;
    }

    db.get('SELECT * FROM piste WHERE user = ?', [name], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Track not found' });
        }

        const stmt = db.prepare('INSERT INTO bookings (name, username, date, tickets_number) VALUES (?, ?, ?, ?)');

        stmt.run([name, username, date, tickets_number], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error saving booking' });
            }

            res.status(200).json({ name, status: "ok", date, tickets_number });
        });

        stmt.finalize();
    });
});



/**
 * @swagger
 * /getVehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags:
 *       - Vehicles
 *     responses:
 *       200:
 *         description: List of all vehicles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The vehicle's unique identifier.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the vehicle.
 *                     example: "Ferrari 488"
 *                   type:
 *                     type: string
 *                     description: The type of the vehicle (e.g., car, truck).
 *                     example: "car"
 *                   color:
 *                     type: string
 *                     description: The color of the vehicle.
 *                     example: "Red"
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: The price of the vehicle.
 *                     example: 250000.00
 *       500:
 *         description: Database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the issue with the database.
 *                 example: "Database error"
 */



app.get('/getVehicles', (req, res) => {
    db.all('SELECT * FROM vehicles', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        console.log("a");
        console.log(rows);

        res.status(200).json(rows);
    });
});



/**
 * @swagger
 * /bookvehicle:
 *   post:
 *     summary: Book a vehicle for a track
 *     tags:
 *       - Vehicles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the vehicle being booked.
 *                 example: "Ferrari 488"
 *               track:
 *                 type: string
 *                 description: The track where the vehicle will be booked.
 *                 example: "Monza"
 *               username:
 *                 type: string
 *                 description: The username of the person booking the vehicle.
 *                 example: "john_doe"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date of the booking.
 *                 example: "2024-12-25"
 *               vehicles_number:
 *                 type: integer
 *                 description: The number of vehicles to be booked.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Vehicle successfully booked for the track.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the booked vehicle.
 *                   example: "Ferrari 488"
 *                 track:
 *                   type: string
 *                   description: The track where the vehicle was booked.
 *                   example: "Monza"
 *                 username:
 *                   type: string
 *                   description: The username of the person who booked the vehicle.
 *                   example: "john_doe"
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of the booking.
 *                   example: "2024-12-25"
 *                 vehicles_number:
 *                   type: integer
 *                   description: The number of vehicles booked.
 *                   example: 2
 *       500:
 *         description: Database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the issue with the database.
 *                 example: "Database error"
 *       404:
 *         description: Track not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the track was not found.
 *                 example: "Track not found"
 */


app.post('/bookvehicle', (req, res) => {
    const { name, track, username, date, vehicles_number } = req.body;

    if (validateFields([{ name: 'name', value: name }, { name: 'track', value: track }, { name: 'username', value: username }, { name: 'date', value: date }, { name: 'vehicles_number', value: vehicles_number }], res)) {
        return;
    }

    db.get('SELECT * FROM piste WHERE user = ?', [track], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'Track not found' });
        }

        const stmt = db.prepare('INSERT INTO vehicles (name, track, username, date, vehicles_number) VALUES (?, ?, ?, ?, ?)');

        stmt.run([name, track, username, date, vehicles_number], function (err) {
            if (err) {
                return res.status(500).json({ message: 'Error saving vehicle booking' });
            }

            res.status(200).json({ name, track, username, date, vehicles_number });
        });

        stmt.finalize();
    });
});



/**
 * @swagger
 * /getBookings:
 *   get:
 *     summary: Retrieve all bookings
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: A list of all bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the booked vehicle.
 *                     example: "Ferrari 488"
 *                   track:
 *                     type: string
 *                     description: The track where the vehicle is booked.
 *                     example: "Monza"
 *                   username:
 *                     type: string
 *                     description: The username of the person who made the booking.
 *                     example: "john_doe"
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date of the booking.
 *                     example: "2024-12-25"
 *                   vehicles_number:
 *                     type: integer
 *                     description: The number of vehicles booked.
 *                     example: 2
 *       500:
 *         description: Database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the issue with the database.
 *                 example: "Database error"
 */



app.get("/getBookings", (req, res) => {
    db.all("SELECT * FROM bookings", (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json(rows);
    });
});



/**
 * @swagger
 * /deleteBooking:
 *   delete:
 *     summary: Delete a booking
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: body
 *         name: booking
 *         description: The booking to be deleted.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the vehicle in the booking.
 *               example: "Ferrari 488"
 *             username:
 *               type: string
 *               description: The username of the person who made the booking.
 *               example: "john_doe"
 *     responses:
 *       200:
 *         description: Booking deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message for successful deletion.
 *                   example: "Booking deleted successfully"
 *       400:
 *         description: Missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for missing parameters.
 *                   example: "Name and username are required."
 *       404:
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for booking not found.
 *                   example: "Booking not found"
 *       500:
 *         description: Error deleting the booking.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the issue with the deletion.
 *                   example: "Error deleting booking"
 */


app.delete('/deleteBooking', (req, res) => {
    const { name, username } = req.body;

    if (validateFields([{ name: 'name', value: name }, { name: 'username', value: username }], res)) {
        return;
    }

    const stmt = db.prepare('DELETE FROM bookings WHERE name = ? AND username = ?');

    stmt.run([name, username], function (err) {
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

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});