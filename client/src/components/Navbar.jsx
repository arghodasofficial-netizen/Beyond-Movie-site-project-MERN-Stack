// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    
    
    const [releaseYears, setReleaseYears] = useState([]);

    
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies/years');
                setReleaseYears(res.data);
            } catch (error) {
                console.error("Error fetching years:", error);
            }
        };
        fetchYears();
    }, []);

   
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 1) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/search?q=${searchTerm}`);
                    setSuggestions(res.data);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

   
    const handleSearchEnter = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/search/${searchTerm}`);
            setSuggestions([]);
            setSearchTerm(""); 
        }
    };

    
    const handleSuggestionClick = (id) => {
        setSearchTerm(""); 
        setSuggestions([]); 
        navigate(`/movie/${id}`); 
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <span className="logo-icon">B</span>
                    BEYOND
                </Link>
            </div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                
                <li className="dropdown">
                    <span>Genre ▼</span>
                    <div className="dropdown-content">
                        <Link to="/category/Action">Action</Link>
                        <Link to="/category/Horror">Horror</Link>
                        <Link to="/category/Comedy">Comedy</Link>
                        <Link to="/category/Thriller">Thriller</Link>
                        <Link to="/category/Drama">Drama</Link>
                    </div>
                </li>

            
                <li className="dropdown">
                    <span>Release ▼</span>
                    <div className="dropdown-content">
                        {releaseYears.length > 0 ? (
                            releaseYears.map((year) => (
                                <Link key={year} to={`/release/${year}`}>
                                    {year}
                                </Link>
                            ))
                        ) : (
                            <span style={{padding: '10px', color: '#666', fontSize: '12px'}}>No movies yet</span>
                        )}
                    </div>
                </li>
                
                <li><Link to="/request">Request</Link></li>
            </ul>

          
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="search-box"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchEnter}
                />
                <span style={{ cursor: 'pointer', paddingRight: '10px' }}>🔍</span>

                {suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((movie) => (
                            <div 
                                key={movie._id} 
                                className="suggestion-item"
                                
                                onClick={() => handleSuggestionClick(movie._id)} 
                            >
                                <img src={`http://localhost:5000/uploads/${movie.thumbnailUrl}`} alt="" />
                                <div className="suggestion-info">
                                    <h4>{movie.title}</h4>
                                    <span>{new Date(movie.releaseDate).getFullYear()} • {movie.genre}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;