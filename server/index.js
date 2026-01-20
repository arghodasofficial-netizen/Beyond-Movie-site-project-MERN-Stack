// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const Movie = require('./models/Movie');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}



mongoose.connect('mongodb+srv://arghodasofficial_db_user:movie1234@cluster0.hifdn5l.mongodb.net/bangla-plex?appName=Cluster0')
.then(() => console.log('✅ MongoDB Connected (Online)'))
.catch(err => console.error('❌ MongoDB Error:', err));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


app.post('/api/movies', upload.fields([
    { name: 'thumbnail', maxCount: 1 }, 
    { name: 'video', maxCount: 1 },       
    { name: 'seriesVideos', maxCount: 20 } 
]), async (req, res) => {
    try {
        
        const { title, description, releaseDate, genre, isFeatured, type, episodeData } = req.body;
        
        if (!req.files || !req.files.thumbnail) {
            return res.status(400).json({ error: "Thumbnail is required!" });
        }

        
        let movieData = {
            title,
            description,
            releaseDate,
            genre,
            type: type || 'movie', 
            isFeatured: isFeatured === 'true',
            thumbnailUrl: req.files.thumbnail[0].filename
        };

      
        if (type === 'movie') {
            if (req.files.video) {
                movieData.videoUrl = req.files.video[0].filename;
            } else {
                return res.status(400).json({ error: "Video file required for Movie!" });
            }
        } else if (type === 'series') {
       
            if (episodeData) {
                const episodesInfo = JSON.parse(episodeData); 
                const uploadedFiles = req.files.seriesVideos || [];

                
                const episodes = episodesInfo.map((ep, index) => ({
                    title: ep.title,
                    episodeNumber: ep.episodeNumber,
                    season: ep.season,
                    videoUrl: uploadedFiles[index] ? uploadedFiles[index].filename : ''
                }));
                
                movieData.episodes = episodes;
            }
        }

        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json({ message: "Upload Successful!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});


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


app.get('/api/movies/years', async (req, res) => {
    try {
        const years = await Movie.aggregate([
            { $project: { year: { $year: "$releaseDate" } } },
            { $group: { _id: "$year" } },
            { $sort: { _id: -1 } }
        ]);
        
        res.json(years.map(y => y._id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});


app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: "Server Error or Invalid ID" });
    }
});


app.put('/api/movies/:id', upload.fields([
    { name: 'newVideos', maxCount: 10 }
]), async (req, res) => {
    try {
        const { isFeatured, newEpisodeData } = req.body;
        const movie = await Movie.findById(req.params.id);

        if (!movie) return res.status(404).json({ error: "Not Found" });

       
        if (isFeatured !== undefined) {
            movie.isFeatured = isFeatured === 'true';
        }

        
        if (newEpisodeData && req.files.newVideos) {
            const episodesInfo = JSON.parse(newEpisodeData);
            const uploadedFiles = req.files.newVideos;

            const newEpisodes = episodesInfo.map((ep, index) => ({
                title: ep.title,
                episodeNumber: ep.episodeNumber,
                season: ep.season,
                videoUrl: uploadedFiles[index].filename
            }));

           
            movie.episodes.push(...newEpisodes);
        }

        await movie.save();
        res.json({ message: "Updated Successfully!", movie });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Update Failed" });
    }
});


app.post('/api/movies/:id/reviews', async (req, res) => {
    try {
        const { user, rating, comment } = req.body;
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            const newReview = { user, rating: Number(rating), comment };
            movie.reviews.push(newReview);
            await movie.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});


app.put('/api/movies/feature/:id', async (req, res) => {
    try {
        const { isFeatured } = req.body; 
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) return res.status(404).json({ error: "Not Found" });

        movie.isFeatured = isFeatured; 
        await movie.save();
        
        res.json({ message: "Status Updated Successfully!" });
    } catch (error) {
        console.error(error);
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
    res.send('Server is Running perfectly!');
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});