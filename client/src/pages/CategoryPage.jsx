// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css';

const CategoryPage = () => {
    const { genre } = useParams(); 
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies');
                let allMovies = res.data;

               
                if (genre !== 'All') {
                    allMovies = allMovies.filter(movie => 
                        movie.genre.toLowerCase() === genre.toLowerCase()
                    );
                }
                
                setMovies(allMovies);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };
        fetchMovies();
    }, [genre]);

    return (
        <div style={{ padding: '40px' }}>
            <h2 style={{ color: '#e50914', borderBottom: '2px solid #333', paddingBottom: '10px', textTransform: 'uppercase' }}>
                {genre} Movies Collection
            </h2>
            
            <div className="movie-grid" style={{ marginTop: '30px' }}>
                {movies.map((movie) => (
                    <div key={movie._id} className="movie-card">
                        <img 
                            src={`http://localhost:5000/uploads/${movie.thumbnailUrl}`} 
                            alt={movie.title} 
                            className="poster-img"
                        />
                        <div className="card-badges">
                            <span className="badge badge-hd">HD</span>
                            <span className="badge badge-year">{new Date(movie.releaseDate).getFullYear()}</span>
                        </div>
                        <div className="card-info">
                            <h3 className="movie-title">{movie.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
            
            {movies.length === 0 && <p style={{ color: 'white' }}>No movies found in this category.</p>}
        </div>
    );
};

export default CategoryPage;