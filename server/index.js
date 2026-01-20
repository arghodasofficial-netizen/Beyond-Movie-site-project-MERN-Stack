const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Movie = require('./models/Movie');

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
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Upload Folder Check
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
mongoose.connect('mongodb+srv://arghodasofficial_db_user:movie1234@cluster0.hifdn5l.mongodb.net/bangla-plex?appName=Cluster0')
.then(() => console.log('✅ MongoDB Connected (Online)'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Multer Config (Only for Thumbnails now)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ---------------------------------------------------------
//  UPLOAD API (MODIFIED FOR LINK SYSTEM)
// ---------------------------------------------------------
app.post('/api/movies', upload.single('thumbnail'), async (req, res) => {
    try {
        // এখন আমরা ভিডিও ফাইল নেব না, ভিডিওর লিঙ্ক (videoUrl) নেব
        const { title, description, releaseDate, genre, isFeatured, type, episodeData, videoUrl } = req.body;
        
        // শুধু ছবি (Thumbnail) আপলোড হবে
        if (!req.file) {
            return res.status(400).json({ error: "Thumbnail is required!" });
        }

        let movieData = {
            title,
            description,
            releaseDate,
            genre,
            type: type || 'movie', 
            isFeatured: isFeatured === 'true',
            thumbnailUrl: req.file.filename, // ছবির নাম সেভ হবে
            videoUrl: videoUrl || '' // ভিডিওর লিঙ্ক সেভ হবে (ফাইল না)
        };

        // Series এর জন্য লজিক
        if (type === 'series' && episodeData) {
            const episodesInfo = JSON.parse(episodeData); 
            // এপিসোডের ভেতরেও এখন ভিডিওর লিঙ্ক থাকবে
            movieData.episodes = episodesInfo;
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json({ message: "Upload Successful!" });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});
// ---------------------------------------------------------

app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ uploadDate: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

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

app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: "Movie deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send('Server is Running with Link System!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});