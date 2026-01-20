// src/pages/MoviePlayer.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player'; // 👈 ভিডিও চালানোর জন্য নতুন প্লেয়ার
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
                // ১. নির্দিষ্ট মুভি লোড করা
                const { data } = await axios.get(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/${id}`);
                setMovie(data);
                
                // ভিডিও সেটআপ (সিরিজ হলে ১ম এপিসোড, মুভি হলে ডাইরেক্ট ভিডিও)
                if (data.type === 'series' && data.episodes && data.episodes.length > 0) {
                    setCurrentVideo(data.episodes[0].videoUrl); 
                    setActiveEpIndex(0);
                } else {
                    setCurrentVideo(data.videoUrl);
                }
                
                setNewFeatured(data.isFeatured);

                // ২. রিলেটেড মুভি লোড করা
                const allRes = await axios.get('https://beyond-movie-site-project-mern-stack.onrender.com/api/movies');
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
            await axios.put(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/feature/${id}`, {
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
            await axios.post(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/${id}/reviews`, {
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

    if (!movie) return <div style={{color:'white', padding:'50px', textAlign:'center'}}>Loading Player...</div>;

    return (
        <div className="player-page-container">
            
            <div className="main-content">

                {/* 👇 VIDEO PLAYER SECTION (CHANGED) */}
                <div className="video-wrapper" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                    <ReactPlayer 
                        url={currentVideo} 
                        className="react-player"
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={true}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        config={{
                            file: { attributes: { controlsList: 'nodownload' } } // ডাউনলোড অপশন লুকানোর চেষ্টা
                        }}
                    />
                </div>

                {/* 👇 EPISODE LIST (SERIES ONLY) */}
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

                {/* TITLE & INFO */}
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

                {/* --- COMMENTS SECTION --- */}
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

            {/* 👇 SIDEBAR (UPDATED LINKS & IMAGES) */}
            <div className="sidebar">
                <h3>📺 More Like This</h3>
                <div className="suggestion-list">
                    {relatedMovies.map(rel => (
                        // Link পরিবর্তন করা হয়েছে: /movie/ থেকে /player/
                        <Link to={`/player/${rel._id}`} key={rel._id} className="suggestion-card">
                            {/* Image Source ফিক্স করা হয়েছে (Direct Link) */}
                            <img 
                                src={rel.thumbnailUrl} 
                                alt={rel.title} 
                                onError={(e) => {e.target.src = "https://via.placeholder.com/150"}}
                            />
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