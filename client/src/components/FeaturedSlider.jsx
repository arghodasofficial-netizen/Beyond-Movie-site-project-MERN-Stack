// src/components/FeaturedSlider.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // বা আপনার স্লাইডার CSS

const FeaturedSlider = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // শুধু Featured মুভিগুলো ফিল্টার করা
    const featuredMovies = movies.filter(movie => movie.isFeatured === true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // ৫ সেকেন্ড পর পর স্লাইড চেঞ্জ হবে
        return () => clearInterval(interval);
    }, [featuredMovies.length]);

    if (featuredMovies.length === 0) return null;

    return (
        <div className="featured-slider">
            {featuredMovies.map((movie, index) => (
                <div 
                    key={movie._id} 
                    className={`slider-item ${index === currentIndex ? 'active' : ''}`}
                    style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${movie.thumbnailUrl})` 
                    }}
                >
                    <div className="slider-content">
                        <span className="featured-badge">🔥 Trending Now</span>
                        <h1>{movie.title}</h1>
                        <p className="slider-meta">
                            {new Date(movie.releaseDate).getFullYear()} • {movie.genre}
                        </p>
                        <p className="slider-desc">{movie.description?.substring(0, 100)}...</p>
                        
                        {/* 👇 এখানে লিঙ্ক ঠিক করা হয়েছে (/movie/ ব্যবহার করা হয়েছে) */}
                        <Link to={`/movie/${movie._id}`} className="watch-btn">
                            ▶ Watch Now
                        </Link>
                    </div>
                </div>
            ))}
            
            {/* Dots Indicator */}
            <div className="slider-dots">
                {featuredMovies.map((_, idx) => (
                    <span 
                        key={idx} 
                        className={`dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default FeaturedSlider;