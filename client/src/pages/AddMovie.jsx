// src/pages/AddMovie.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AddMovie = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    
    // Data State
    const [contentList, setContentList] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Form State
    const [activeTab, setActiveTab] = useState('movie'); 
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [genre, setGenre] = useState('Action');
    const [date, setDate] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    
    // 👇 সব লিঙ্ক সিস্টেম
    const [thumbnailLink, setThumbnailLink] = useState(''); // ছবির লিঙ্ক
    const [videoLink, setVideoLink] = useState(''); // ভিডিওর লিঙ্ক
    
    // 👇 সিরিজ ডাটা (সিজন ও এপিসোড সহ)
    const [episodes, setEpisodes] = useState([
        { title: '', episodeNumber: 1, season: 1, videoUrl: '' }
    ]);

    // Fetch Existing Content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('https://beyond-movie-site-project-mern-stack.onrender.com/api/movies');
                setContentList(res.data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchContent();
    }, [refreshTrigger]);

    // Delete Function
    const handleDelete = async (id) => {
        if (window.confirm("Sure you want to DELETE?")) {
            try {
                await axios.delete(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/${id}`);
                setRefreshTrigger(prev => !prev);
            } catch (error) {
                alert("Failed to delete.");
            }
        }
    };

    // Featured Toggle
    const toggleFeatured = async (id, currentStatus) => {
        try {
            await axios.put(`https://beyond-movie-site-project-mern-stack.onrender.com/api/movies/feature/${id}`, {
                isFeatured: !currentStatus
            });
            setRefreshTrigger(prev => !prev);
        } catch (error) { console.error(error); }
    };

    // Series Handlers
    const addEpisodeField = () => {
        setEpisodes([...episodes, { title: '', episodeNumber: episodes.length + 1, season: 1, videoUrl: '' }]);
    };

    const handleEpisodeChange = (index, field, value) => {
        const newEpisodes = [...episodes];
        newEpisodes[index][field] = value;
        setEpisodes(newEpisodes);
    };

    // 🚀 MAIN UPLOAD FUNCTION (JSON Data)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        // সাধারণ JSON ডাটা তৈরি (FormData আর লাগবে না)
        const payload = {
            type: activeTab,
            title,
            description: desc,
            genre,
            releaseDate: date,
            isFeatured,
            thumbnailUrl: thumbnailLink, // সরাসরি লিঙ্ক যাচ্ছে
            videoUrl: activeTab === 'movie' ? videoLink : '', // মুভি হলে ভিডিও লিঙ্ক
            episodeData: activeTab === 'series' ? episodes : [] // সিরিজ হলে এপিসোড লিস্ট
        };

        try {
            await axios.post('https://beyond-movie-site-project-mern-stack.onrender.com/api/movies', payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('✅ Upload Successful!');
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
                <h2 className="form-header">Upload via Link (Fast ⚡)</h2>
                
                <div className="type-tabs">
                    <button className={`tab-btn ${activeTab === 'movie' ? 'active' : ''}`} onClick={() => setActiveTab('movie')}>🎬 Movie</button>
                    <button className={`tab-btn ${activeTab === 'series' ? 'active' : ''}`} onClick={() => setActiveTab('series')}>📺 Series</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input className="modern-input" type="text" placeholder="Title" onChange={e => setTitle(e.target.value)} required />
                    <textarea className="modern-textarea" rows="2" placeholder="Description" onChange={e => setDesc(e.target.value)} required />
                    
                    <div style={{display:'flex', gap:'15px'}}>
                        <select className="modern-select" onChange={e => setGenre(e.target.value)}>
                            <option>Action</option><option>Comedy</option><option>Horror</option>
                            <option>Thriller</option><option>Drama</option>
                        </select>
                        <input className="modern-input" type="date" onChange={e => setDate(e.target.value)} required />
                    </div>

                    {/* 👇 THUMBNAIL LINK INPUT */}
                    <div className="file-input-wrapper" style={{borderColor: '#00d4ff', borderStyle:'dashed'}}>
                        <label style={{color:'#00d4ff', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Thumbnail Image Link</label>
                        <input 
                            className="modern-input" 
                            type="text" 
                            placeholder="Paste Image Link (https://...)" 
                            onChange={e => setThumbnailLink(e.target.value)} 
                            required 
                        />
                    </div>

                    <div style={{margin: '15px 0', background: '#252525', padding: '10px', borderRadius: '8px'}}>
                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'10px'}}>
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{transform:'scale(1.5)'}} />
                            Add to Featured Slider
                        </label>
                    </div>

                    {/* 👇 MOVIE VIDEO LINK */}
                    {activeTab === 'movie' && (
                        <div className="file-input-wrapper" style={{borderColor: '#e50914', borderStyle: 'dashed'}}>
                            <label style={{color:'#e50914', fontWeight:'bold', display: 'block', marginBottom: '8px'}}>Movie Video Link</label>
                            <input className="modern-input" type="text" placeholder="Paste YouTube/Drive Link" onChange={e => setVideoLink(e.target.value)} required />
                        </div>
                    )}

                    {/* 👇 SERIES EPISODES INPUT */}
                    {activeTab === 'series' && (
                        <div>
                            {episodes.map((ep, index) => (
                                <div key={index} className="episode-card">
                                    <h4 style={{margin:'0 0 10px 0', color:'#e50914'}}>Ep {index + 1}</h4>
                                    <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                                        <input className="modern-input" placeholder="Ep Title" value={ep.title} onChange={e => handleEpisodeChange(index, 'title', e.target.value)} />
                                        
                                        {/* Season & Episode Number Inputs */}
                                        <input className="modern-input" type="number" placeholder="S-No" value={ep.season} onChange={e => handleEpisodeChange(index, 'season', e.target.value)} style={{width:'60px'}} title="Season Number" />
                                        <input className="modern-input" type="number" placeholder="Ep-No" value={ep.episodeNumber} onChange={e => handleEpisodeChange(index, 'episodeNumber', e.target.value)} style={{width:'60px'}} title="Episode Number" />
                                    </div>
                                    <input className="modern-input" type="text" placeholder="Paste Episode Video Link" value={ep.videoUrl} onChange={e => handleEpisodeChange(index, 'videoUrl', e.target.value)} required />
                                </div>
                            ))}
                            <button type="button" onClick={addEpisodeField} className="add-ep-btn">+ Add Next Episode</button>
                        </div>
                    )}

                    <button type="submit" className="upload-btn" disabled={uploading}>
                        {uploading ? 'Saving...' : '🚀 Publish'}
                    </button>
                </form>
            </div>

            {/* Manage Section */}
            <div className="manage-container">
                <h2 className="form-header" style={{marginTop: '50px'}}>Manage Content</h2>
                
                <h3 className="section-title">Movies</h3>
                <div className="content-list">
                    {movieList.map(item => (
                        <div key={item._id} className="content-item">
                            {/* এখন ইমেজ লিঙ্ক সরাসরি src এ বসবে */}
                            <img src={item.thumbnailUrl} alt="" className="item-thumb" onError={(e)=>{e.target.src='https://via.placeholder.com/150'}}/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{new Date(item.releaseDate).getFullYear()}</span>
                            </div>
                            <div className="action-buttons">
                                <button onClick={() => handleDelete(item._id)} className="delete-btn">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="section-title" style={{marginTop:'30px'}}>Series</h3>
                <div className="content-list">
                    {seriesList.map(item => (
                        <div key={item._id} className="content-item" style={{borderColor: '#7d2ae8'}}>
                            <img src={item.thumbnailUrl} alt="" className="item-thumb" onError={(e)=>{e.target.src='https://via.placeholder.com/150'}}/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{item.episodes?.length || 0} Eps</span>
                            </div>
                            <div className="action-buttons">
                                <button onClick={() => handleDelete(item._id)} className="delete-btn">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddMovie;