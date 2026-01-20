// src/pages/MoviePlayer.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

const MoviePlayer = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [relatedMovies, setRelatedMovies] = useState([]);
    

    const [currentVideo, setCurrentVideo] = useState(null);
    const [activeEpIndex, setActiveEpIndex] = useState(0);


    const [newFeatured, setNewFeatured] = useState(false);
    const [reviewUser, setReviewUser] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/movies/${id}`);
                setMovie(data);
                
               
                if (data.type === 'series' && data.episodes.length > 0) {
                    setCurrentVideo(data.episodes[0].videoUrl); // সিরিজের প্রথম এপিসোড
                    setActiveEpIndex(0);
                } else {
                    setCurrentVideo(data.videoUrl);
                }
                
               
                setNewFeatured(data.isFeatured);

                
                const allRes = await axios.get('http://localhost:5000/api/movies');
                const suggestions = allRes.data.filter(m => 
                    m.genre === data.genre && m._id !== data._id
                );
                setRelatedMovies(suggestions);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);


    const changeEpisode = (ep, index) => {
        setCurrentVideo(ep.videoUrl);
        setActiveEpIndex(index);
    };



    const handleUpdate = async () => {
        try {
            
            await axios.put(`http://localhost:5000/api/movies/feature/${id}`, {
                isFeatured: newFeatured
            });
            alert('Updated Successfully!');
            window.location.reload();
        } catch (error) {
            alert('Update Failed');
        }
    };


    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/movies/${id}/reviews`, {
                user: reviewUser,
                rating: reviewRating,
                comment: reviewComment
            });
            alert('Review Added!');
            window.location.reload();
        } catch (error) {
            alert('Error adding review');
        }
    };

    if (!movie) return <div style={{color:'white', padding:'50px'}}>Loading...</div>;

    return (
        <div className="player-page-container">
            
            <div className="main-content">

                <div className="video-wrapper">
                    <video 
                        key={currentVideo} 
                        controls 
                        className="main-video"
                        src={`http://localhost:5000/uploads/${currentVideo}`}
                        poster={`http://localhost:5000/uploads/${movie.thumbnailUrl}`}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

             
                {movie.type === 'series' && (
                    <div className="episode-list-container">
                        <h3>📺 Episodes: Season 1</h3>
                        <div className="episodes-grid">
                            {movie.episodes.map((ep, index) => (
                                <button 
                                    key={index}
                                    onClick={() => changeEpisode(ep, index)}
                                    className={`ep-btn ${activeEpIndex === index ? 'active-ep' : ''}`}
                                >
                                    ▶ Ep {ep.episodeNumber}: {ep.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

   
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
                    <h1 className="player-title" style={{margin:0}}>{movie.title}</h1>
                    {movie.type === 'series' && <span className="badge badge-hd">WEB SERIES</span>}
                </div>

                <div className="player-meta">
                    <span>📅 {new Date(movie.releaseDate).getFullYear()}</span>
                    <span className="genre-tag">{movie.genre}</span>
                    <span>⭐ {movie.reviews.length > 0 ? (movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length).toFixed(1) : 'No Ratings'}</span>
                </div>
                <p className="player-desc">{movie.description}</p>

                {/* --- ADMIN EDIT CONTROL --- */}
                <div style={{marginTop: '20px', padding: '15px', border: '1px solid #333', borderRadius: '5px', background: '#161616'}}>
                    <h4 style={{color: 'gold', margin:'0 0 10px 0'}}>⚙️ Admin Control</h4>
                    <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color:'white'}}>
                            <input 
                                type="checkbox" 
                                checked={newFeatured} 
                                onChange={(e) => setNewFeatured(e.target.checked)} 
                            />
                            Set as 🔥 Featured Movie
                        </label>
                        <button onClick={handleUpdate} style={{padding: '5px 15px', background: '#e50914', border:'none', color:'white', cursor:'pointer', borderRadius:'3px'}}>
                            Save Changes
                        </button>
                    </div>
                </div>

           
                <div className="comments-section" style={{marginTop:'40px'}}>
                    <h3>📝 Reviews & Comments</h3>
                    
                    <form onSubmit={submitReview} className="review-form">
                        <input type="text" placeholder="Your Name" required value={reviewUser} onChange={(e)=>setReviewUser(e.target.value)} />
                        <select value={reviewRating} onChange={(e)=>setReviewRating(e.target.value)}>
                            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                            <option value="4">⭐⭐⭐⭐ (Good)</option>
                            <option value="3">⭐⭐⭐ (Average)</option>
                            <option value="2">⭐⭐ (Bad)</option>
                            <option value="1">⭐ (Terrible)</option>
                        </select>
                        <textarea placeholder="Write a comment..." required value={reviewComment} onChange={(e)=>setReviewComment(e.target.value)}></textarea>
                        <button type="submit">Post Review</button>
                    </form>

                    <div className="reviews-list">
                        {movie.reviews.map((rev, index) => (
                            <div key={index} className="review-item">
                                <strong>{rev.user}</strong> <span style={{color:'gold'}}>{"★".repeat(rev.rating)}</span>
                                <p>{rev.comment}</p>
                            </div>
                        )).reverse()}
                    </div>
                </div>
            </div>

     
            <div className="sidebar">
                <h3>📺 More Like This</h3>
                <div className="suggestion-list">
                    {relatedMovies.map(rel => (
                        <Link to={`/movie/${rel._id}`} key={rel._id} className="suggestion-card">
                            <img src={`http://localhost:5000/uploads/${rel.thumbnailUrl}`} alt="" />
                            <div className="sug-info">
                                <h4>{rel.title}</h4>
                                <span>{new Date(rel.releaseDate).getFullYear()}</span>
                            </div>
                        </Link>
                    ))}
                    {relatedMovies.length === 0 && <p style={{color:'#666'}}>No similar movies found.</p>}
                </div>
            </div>

        </div>
    );
};

export default MoviePlayer;