// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FeaturedSlider from '../components/FeaturedSlider';
import '../App.css';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [activeTab, setActiveTab] = useState('All'); 

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies');
                setMovies(res.data);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };
        fetchMovies();
    }, []);

    
    const getFilteredMovies = () => {
        let filtered = movies;
        
        
        
        if (activeTab !== 'All') {
            filtered = movies.filter(m => 
                m.genre && m.genre.toLowerCase().trim() === activeTab.toLowerCase().trim()
            );
        }
        
    
        return filtered.slice(0, 12);
    };

    
    const webSeries = movies.filter(m => m.type === 'series').slice(0, 6);

    
    const getRating = (movie) => {
        if (!movie.reviews || movie.reviews.length === 0) return "N/A";
        const avg = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;
        return avg.toFixed(1);
    };

    return (
        <div style={{ paddingBottom: '50px' }}>
         
            <FeaturedSlider movies={movies} /> 

            <div style={{ padding: '0 40px', marginTop: '40px' }}>
                
              
                <div className="section-header">
                    <h2 style={{ margin: 0, color: 'white', fontSize: '22px', borderLeft:'4px solid #e50914', paddingLeft:'10px' }}>
                        Latest Updates
                    </h2>
                    
                   
                    <div className="filter-tabs">
                        {['All', 'Thriller', 'Horror', 'Comedy', 'Action'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`filter-btn ${activeTab === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <Link to="/category/All" style={{ marginLeft: 'auto', color: '#e50914', textDecoration: 'none', fontWeight: 'bold', fontSize:'14px' }}>
                        View More »
                    </Link>
                </div>

       
                <div className="movie-grid">
                    {getFilteredMovies().map((item) => (
                        <Link to={`/movie/${item._id}`} key={item._id} className="movie-card">
                            <img src={`http://localhost:5000/uploads/${item.thumbnailUrl}`} alt={item.title} className="poster-img"/>
                            
                        
                            <div className="card-badges">
                                <div className="badge-group-left">
                                    <span className="badge badge-hd">{item.type === 'series' ? 'WEB' : 'HD'}</span>
                                    <span className="badge badge-year">{new Date(item.releaseDate).getFullYear()}</span>
                                </div>
                                
                                <span className="badge badge-imdb">
                                    ⭐ {getRating(item)}
                                </span>
                            </div>

                            <div className="card-info">
                                <h3 className="movie-title">{item.title}</h3>
                                <p className="movie-genre">{item.genre} • {item.type === 'series' ? 'Series' : 'Movie'}</p>
                            </div>
                        </Link>
                    ))}
                    {getFilteredMovies().length === 0 && (
                        <div style={{color:'#666', padding:'20px', textAlign:'center', width:'100%'}}>
                            No content found in "{activeTab}". Try adding some movies!
                        </div>
                    )}
                </div>


              
                {webSeries.length > 0 && (
                    <div style={{ marginTop: '50px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '22px', borderLeft:'4px solid #7d2ae8', paddingLeft:'10px' }}>
                                📺 Popular Web Series
                            </h2>
                            <Link to="/category/All" style={{ color: '#7d2ae8', textDecoration: 'none', fontWeight: 'bold', fontSize:'14px' }}>
                                View More »
                            </Link>
                        </div>
                        
                        <div className="movie-grid">
                            {webSeries.map((item) => (
                                <Link to={`/movie/${item._id}`} key={item._id} className="movie-card">
                                    <img src={`http://localhost:5000/uploads/${item.thumbnailUrl}`} alt={item.title} className="poster-img"/>
                                    <div className="card-badges">
                                        <div className="badge-group-left">
                                            <span className="badge badge-hd" style={{background:'#e50914'}}>EPISODES</span>
                                            <span className="badge badge-year">{new Date(item.releaseDate).getFullYear()}</span>
                                        </div>
                                        <span className="badge badge-imdb">⭐ {getRating(item)}</span>
                                    </div>
                                    <div className="card-info">
                                        <h3 className="movie-title">{item.title}</h3>
                                        <p className="movie-genre">{item.episodes ? item.episodes.length : 0} Episodes</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Home;