// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Movie = require('./models/Movie'); // আপনার মডেল ফাইল

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://beyond-movie-site-project-mern-stac.vercel.app" 
    ],
    credentials: true
}));
app.use(express.json()); // JSON ডেটা রিসিভ করার জন্য

// MongoDB Connection
mongoose.connect('mongodb+srv://arghodasofficial_db_user:movie1234@cluster0.hifdn5l.mongodb.net/bangla-plex?appName=Cluster0')
.then(() => console.log('✅ MongoDB Connected (Online)'))
.catch(err => console.error('❌ MongoDB Error:', err));


// ---------------------------------------------------------
//  API ROUTES (LINK SYSTEM ONLY)
// ---------------------------------------------------------

// 1. Upload Movie/Series (POST)
app.post('/api/movies', async (req, res) => {
    try {
        const { 
            title, description, releaseDate, genre, 
            isFeatured, type, episodeData, 
            videoUrl, thumbnailUrl // এখন থাম্বনেইলও লিঙ্ক হিসেবে আসবে
        } = req.body;
        
        if (!thumbnailUrl) {
            return res.status(400).json({ error: "Thumbnail Link is required!" });
        }

        let movieData = {
            title,
            description,
            releaseDate,
            genre,
            type: type || 'movie', 
            isFeatured: isFeatured, // true/false সরাসরি আসবে
            thumbnailUrl: thumbnailUrl, // Link save hobe
            videoUrl: videoUrl || ''
        };

        // Series Logic
        if (type === 'series' && episodeData) {
            // episodeData এখন সরাসরি JSON অ্যারে হিসেবে আসবে ফ্রন্টএন্ড থেকে
            movieData.episodes = episodeData;
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json({ message: "Upload Successful!" });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. Get All Movies (GET)
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ _id: -1 }); // নতুন গুলো আগে দেখাবে
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. Search (GET)
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const movies = await Movie.find({
            title: { $regex: q, $options: "i" }
        }).limit(5).select('title thumbnailUrl _id genre releaseDate type'); 
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Search Error" });
    }
});

// 4. Get Single Movie (GET)
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 5. Delete Movie (DELETE)
app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// 6. Toggle Feature (PUT)
app.put('/api/movies/feature/:id', async (req, res) => {
    try {
        const { isFeatured } = req.body; 
        await Movie.findByIdAndUpdate(req.params.id, { isFeatured });
        res.json({ message: "Status Updated!" });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send('Server Running (Full Link System) 🚀');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});