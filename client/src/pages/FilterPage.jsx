// src/pages/FilterPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link } from 'react-router-dom';
import '../App.css';

const FilterPage = () => {
    const { genre, year, query } = useParams();
    const location = useLocation();
    

    const [movies, setMovies] = useState([]);
    const [pageTitle, setPageTitle] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 12; 

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies');
                let allMovies = res.data;
                let filteredMovies = [];

               
                if (location.pathname.includes("/category/")) {
                    if (genre === 'All') {
                        setPageTitle('All Movies Collection');
                        filteredMovies = allMovies; 
                    } else {
                        setPageTitle(`${genre} Movies`);
                        filteredMovies = allMovies.filter(movie => 
                            movie.genre.toLowerCase() === genre.toLowerCase()
                        );
                    }
                } 
               
                else if (location.pathname.includes("/release/")) {
                    setPageTitle(`Movies from ${year}`);
                    filteredMovies = allMovies.filter(movie => {
                        const movieYear = new Date(movie.releaseDate).getFullYear().toString();
                        return movieYear === year;
                    });
                } 
              
                else if (location.pathname.includes("/search/")) {
                    setPageTitle(`Search Results for: "${query}"`);
                    filteredMovies = allMovies.filter(movie => 
                        movie.title.toLowerCase().includes(query.toLowerCase())
                    );
                }

                setMovies(filteredMovies);
                setCurrentPage(1); 
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };
        fetchMovies();
    }, [genre, year, query, location]);

    // --- Pagination Logic ---
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
    const totalPages = Math.ceil(movies.length / moviesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div style={{ padding: '40px', minHeight: '80vh' }}>
            <h2 style={{ color: '#e50914', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                {pageTitle} <span style={{fontSize:'14px', color:'#999'}}>({movies.length} movies)</span>
            </h2>
            
            <div className="movie-grid" style={{ marginTop: '30px' }}>
                {currentMovies.map((movie) => (
                    <Link 
                        to={`/movie/${movie._id}`} 
                        key={movie._id} 
                        className="movie-card"
                        style={{ textDecoration: 'none' }}
                    >
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
                    </Link>
                ))}
            </div>
            
         
            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button 
                            key={i + 1} 
                            onClick={() => paginate(i + 1)}
                            className={currentPage === i + 1 ? 'page-btn active' : 'page-btn'}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {movies.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                    <h3>No movies found! 😕</h3>
                    <p>Try searching for something else.</p>
                </div>
            )}
        </div>
    );
};

export default FilterPage;