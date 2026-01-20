// server/models/Movie.js
const mongoose = require('mongoose');


const episodeSchema = new mongoose.Schema({
    title: { type: String },         
    episodeNumber: { type: Number }, 
    season: { type: Number, default: 1 }, 
    videoUrl: { type: String }       
});

const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    genre: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    
  
    type: { 
        type: String, 
        enum: ['movie', 'series'], 
        default: 'movie' 
    },

   
    videoUrl: { type: String }, 

   
    episodes: [episodeSchema], 

    isFeatured: { type: Boolean, default: false }, 
    reviews: [reviewSchema], 
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);