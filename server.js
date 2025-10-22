const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.static('public')); // To serve frontend files from the 'public' directory

// Database path
const DB_PATH = path.join(__dirname, 'db.json');

// Helper functions to read/write from the JSON database
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        // If file doesn't exist or is corrupted, return a default structure
        return { cars: [], rentals: [] };
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to database:", error);
    }
};

// --- API ROUTES ---

// GET all cars
app.get('/api/cars', (req, res) => {
    const db = readDb();
    res.json(db.cars);
});

// GET all rentals
app.get('/api/rentals', (req, res) => {
    const db = readDb();
    res.json(db.rentals);
});

// POST a new car (Admin)
app.post('/api/cars', (req, res) => {
    const db = readDb();
    const newCar = req.body;
    newCar.id = Date.now(); // Simple unique ID
    newCar.reviews = [];
    db.cars.unshift(newCar);
    writeDb(db);
    res.status(201).json(newCar);
});

// PUT (update) an existing car (Admin)
app.put('/api/cars/:id', (req, res) => {
    const db = readDb();
    const carId = parseInt(req.params.id);
    const updatedData = req.body;
    const carIndex = db.cars.findIndex(c => c.id === carId);

    if (carIndex !== -1) {
        // Preserve reviews when updating
        updatedData.reviews = db.cars[carIndex].reviews;
        db.cars[carIndex] = updatedData;
        writeDb(db);
        res.json(db.cars[carIndex]);
    } else {
        res.status(404).json({ message: 'Car not found' });
    }
});

// DELETE a car (Admin)
app.delete('/api/cars/:id', (req, res) => {
    const db = readDb();
    const carId = parseInt(req.params.id);
    const initialLength = db.cars.length;
    db.cars = db.cars.filter(c => c.id !== carId);

    if (db.cars.length < initialLength) {
        writeDb(db);
        res.status(204).send(); // No content
    } else {
        res.status(404).json({ message: 'Car not found' });
    }
});

// POST a new rental request
app.post('/api/rentals', (req, res) => {
    const db = readDb();
    const newRental = req.body;
    newRental.id = Date.now();
    newRental.status = 'Pending';
    db.rentals.unshift(newRental);
    writeDb(db);
    res.status(201).json(newRental);
});

// PUT to update a rental status (Admin)
app.put('/api/rentals/:id', (req, res) => {
    const db = readDb();
    const rentalId = parseInt(req.params.id);
    const { status } = req.body; // Expecting { "status": "Approved" } or { "status": "Declined" }
    const rentalIndex = db.rentals.findIndex(r => r.id === rentalId);

    if (rentalIndex !== -1) {
        db.rentals[rentalIndex].status = status;
        writeDb(db);
        res.json(db.rentals[rentalIndex]);
    } else {
        res.status(404).json({ message: 'Rental not found' });
    }
});

// POST a new review for a car
app.post('/api/cars/:id/reviews', (req, res) => {
    const db = readDb();
    const carId = parseInt(req.params.id);
    const newReview = req.body;
    const carIndex = db.cars.findIndex(c => c.id === carId);

    if (carIndex !== -1) {
        if (!db.cars[carIndex].reviews) {
            db.cars[carIndex].reviews = [];
        }
        db.cars[carIndex].reviews.unshift(newReview);
        writeDb(db);
        res.status(201).json(newReview);
    } else {
        res.status(404).json({ message: 'Car not found' });
    }
});


// POST for car recommendations
app.post('/api/recommendations', (req, res) => {
    const db = readDb();
    const { budget, usage } = req.body;
    let recommendations = db.cars.filter(car => car.forSale);

    if (budget) {
        recommendations = recommendations.filter(car => car.price <= budget);
    }

    if (usage && usage !== 'any') {
        const usageMapping = {
            daily: ['Hatchback', 'Sedan', 'Electric'],
            family: ['SUV', 'MUV'],
            luxury: 2000000 // price threshold
        };
        
        if(usage === 'luxury') {
            recommendations = recommendations.filter(car => car.price > usageMapping.luxury);
        } else {
            recommendations = recommendations.filter(car => usageMapping[usage].includes(car.type) || usageMapping[usage].includes(car.fuel));
        }
    }
    
    res.json(recommendations);
});

// Fallback to serving the main index.html for any other GET request
// This is what allows your single-page app to work
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    // This message will show in your terminal when the server starts
    console.log(`Server is running on http://localhost:${PORT}`);
});