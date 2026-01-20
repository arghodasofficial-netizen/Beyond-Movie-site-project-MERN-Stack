// src/pages/AddMovie.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AddMovie = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    
    // --- Existing Data State ---
    const [contentList, setContentList] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // --- Upload Form State ---
    const [activeTab, setActiveTab] = useState('movie'); 
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [genre, setGenre] = useState('Action');
    const [date, setDate] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    
    // ছবি ফাইল হিসেবেই থাকবে
    const [thumbnail, setThumbnail] = useState(null);
    
    // ভিডিও এখন লিঙ্ক (Link) হিসেবে থাকবে
    const [videoLink, setVideoLink] = useState(''); 
    
    const [episodes, setEpisodes] = useState([
        { title: '', episodeNumber: 1, season: 1, videoUrl: '' }
    ]);

    
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('https://beyond-movie-site-project-mern-stack.onrender.com/api/movies');
                setContentList(res.data);
            } catch (error) {
                console.error("Error fetching content:", error);
            }
        };
        fetchContent();
    }, [refreshTrigger]);

    
    const toggleFeatured = async (id, currentStatus) => {
        try {
            await axios.put(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/feature/${id}`, {
                isFeatured: !currentStatus
            });
            setRefreshTrigger(prev => !prev);
        } catch (error) {
            console.error(error);
            alert('Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to DELETE this content permanently?");
        if (confirmDelete) {
            try {
                await axios.delete(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/${id}`);
                alert("🗑️ Content Deleted Successfully!");
                setRefreshTrigger(prev => !prev); 
            } catch (error) {
                console.error(error);
                alert("Failed to delete content.");
            }
        }
    };

    const addEpisodeField = () => {
        setEpisodes([...episodes, { title: '', episodeNumber: episodes.length + 1, season: 1, videoUrl: '' }]);
    };

    const handleEpisodeChange = (index, field, value) => {
        const newEpisodes = [...episodes];
        newEpisodes[index][field] = value;
        setEpisodes(newEpisodes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append('type', activeTab);
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('genre', genre);
        formData.append('releaseDate', date);
        formData.append('isFeatured', isFeatured);
        
        // থাম্বনেইল ফাইল হিসেবে যাবে
        formData.append('thumbnail', thumbnail);

        if (activeTab === 'movie') {
            // ভিডিওর লিঙ্ক টেক্সট হিসেবে যাবে
            formData.append('videoUrl', videoLink);
        } else {
            // সিরিজ হলে পুরো এপিসোড ডেটা (লিঙ্কসহ) JSON হিসেবে যাবে
            const episodeInfo = episodes.map(ep => ({
                title: ep.title,
                episodeNumber: ep.episodeNumber,
                season: ep.season,
                videoUrl: ep.videoUrl // ফাইলের বদলে লিঙ্ক
            }));
            formData.append('episodeData', JSON.stringify(episodeInfo));
        }

        try {
            await axios.post('https://beyond-movie-site-project-mern-stack.onrender.com/api/movies', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('✅ Upload Successful! Movie Added via Link.');
            setRefreshTrigger(prev => !prev);
            navigate('/'); 
        } catch (error) {
            console.error(error);
            alert('❌ Upload Failed');
        } finally {
            setUploading(false);
        }
    };

    const movieList = contentList.filter(m => m.type === 'movie' || !m.type);
    const seriesList = contentList.filter(m => m.type === 'series');

    return (
        <div className="admin-page-wrapper">
            
            <div className="upload-container">
                <h2 className="form-header">Upload New Content (Link System)</h2>
                
                <div className="type-tabs">
                    <button className={`tab-btn ${activeTab === 'movie' ? 'active' : ''}`} onClick={() => setActiveTab('movie')}>
                        🎬 Upload Movie
                    </button>
                    <button className={`tab-btn ${activeTab === 'series' ? 'active' : ''}`} onClick={() => setActiveTab('series')}>
                        📺 Upload Series
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input className="modern-input" type="text" placeholder="Content Title" onChange={e => setTitle(e.target.value)} required />
                    <textarea className="modern-textarea" rows="2" placeholder="Description / Plot" onChange={e => setDesc(e.target.value)} required />
                    
                    <div style={{display:'flex', gap:'15px'}}>
                        <select className="modern-select" onChange={e => setGenre(e.target.value)}>
                            <option>Action</option><option>Comedy</option><option>Horror</option>
                            <option>Thriller</option><option>Drama</option><option>Sci-Fi</option>
                        </select>
                        <input className="modern-input" type="date" onChange={e => setDate(e.target.value)} required />
                    </div>

                    <div className="file-input-wrapper">
                        <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Thumbnail Image (Upload File)</label>
                        <input type="file" onChange={e => setThumbnail(e.target.files[0])} required />
                    </div>

                    <div style={{marginBottom: '20px', background: '#252525', padding: '10px', borderRadius: '8px'}}>
                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'10px'}}>
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{transform:'scale(1.5)'}} />
                            Add to 🔥 Featured Slider
                        </label>
                    </div>

                    {/* Movie Link Input */}
                    {activeTab === 'movie' && (
                        <div className="file-input-wrapper" style={{borderColor: '#e50914', borderStyle: 'dashed'}}>
                            <label style={{color:'#e50914', fontWeight:'bold', display: 'block', marginBottom: '8px'}}>Paste Movie Link (YouTube/Drive)</label>
                            <input 
                                className="modern-input" 
                                type="text" 
                                placeholder="https://youtu.be/..." 
                                onChange={e => setVideoLink(e.target.value)} 
                                required 
                            />
                        </div>
                    )}

                    {/* Series Link Inputs */}
                    {activeTab === 'series' && (
                        <div>
                            {episodes.map((ep, index) => (
                                <div key={index} className="episode-card">
                                    <h4 style={{margin:'0 0 10px 0', color:'#e50914'}}>Ep {index + 1}</h4>
                                    <div style={{display:'flex', gap:'10px', marginBottom: '10px'}}>
                                        <input className="modern-input" placeholder="Title" value={ep.title} onChange={e => handleEpisodeChange(index, 'title', e.target.value)} />
                                        <input className="modern-input" type="number" placeholder="No." value={ep.episodeNumber} onChange={e => handleEpisodeChange(index, 'episodeNumber', e.target.value)} style={{width:'80px'}} />
                                    </div>
                                    {/* Video Link Field for Episode */}
                                    <input 
                                        className="modern-input" 
                                        type="text" 
                                        placeholder="Paste Episode Link Here" 
                                        value={ep.videoUrl} 
                                        onChange={e => handleEpisodeChange(index, 'videoUrl', e.target.value)} 
                                        required 
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={addEpisodeField} className="add-ep-btn">+ Add Episode</button>
                        </div>
                    )}

                    <button type="submit" className="upload-btn" disabled={uploading}>
                        {uploading ? 'Processing...' : '🚀 Publish Now'}
                    </button>
                </form>
            </div>

            {/* Manage List (Existing Code) */}
            <div className="manage-container">
                <h2 className="form-header" style={{marginTop: '50px'}}>Manage Content</h2>
                <h3 className="section-title">🎬 Movies List</h3>
                <div className="content-list">
                    {movieList.map(item => (
                        <div key={item._id} className="content-item">
                            <img src={`https://beyond-movie-site-project-mern-stack.onrender.com/uploads/${item.thumbnailUrl}`} alt="" className="item-thumb"/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{new Date(item.releaseDate).getFullYear()} • {item.genre}</span>
                            </div>
                            <div className="action-buttons">
                                <label className="featured-toggle">
                                    <input type="checkbox" checked={item.isFeatured} onChange={() => toggleFeatured(item._id, item.isFeatured)} />
                                    <span className="slider round"></span>
                                    <span className="label-text">{item.isFeatured ? '🔥' : 'Normal'}</span>
                                </label>
                                <button onClick={() => handleDelete(item._id)} className="delete-btn">🗑️</button>
                            </div>
                        </div>
                    ))}
                    {movieList.length === 0 && <p style={{color:'#666'}}>No movies found.</p>}
                </div>

                <h3 className="section-title" style={{marginTop: '30px', color: '#7d2ae8'}}>📺 Web Series List</h3>
                <div className="content-list">
                    {seriesList.map(item => (
                        <div key={item._id} className="content-item" style={{borderColor: '#7d2ae8'}}>
                            <img src={`https://beyond-movie-site-project-mern-stack.onrender.com/uploads/${item.thumbnailUrl}`} alt="" className="item-thumb"/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{item.episodes?.length || 0} Episodes • {item.genre}</span>
                            </div>
                            <div className="action-buttons">
                                <label className="featured-toggle">
                                    <input type="checkbox" checked={item.isFeatured} onChange={() => toggleFeatured(item._id, item.isFeatured)} />
                                    <span className="slider round"></span>
                                    <span className="label-text">{item.isFeatured ? '🔥' : 'Normal'}</span>
                                </label>
                                <button onClick={() => handleDelete(item._id)} className="delete-btn">🗑️</button>
                            </div>
                        </div>
                    ))}
                    {seriesList.length === 0 && <p style={{color:'#666'}}>No series found.</p>}
                </div>
            </div>

        </div>
    );
};

export default AddMovie;