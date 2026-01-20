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
    const [thumbnail, setThumbnail] = useState(null);
    const [singleVideo, setSingleVideo] = useState(null);
    const [episodes, setEpisodes] = useState([
        { title: '', episodeNumber: 1, season: 1, file: null }
    ]);

    
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies');
                setContentList(res.data);
            } catch (error) {
                console.error("Error fetching content:", error);
            }
        };
        fetchContent();
    }, [refreshTrigger]);

    
    const toggleFeatured = async (id, currentStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/movies/feature/${id}`, {
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
                await axios.delete(`http://localhost:5000/api/movies/${id}`);
                alert("🗑️ Content Deleted Successfully!");
                setRefreshTrigger(prev => !prev); // লিস্ট রিফ্রেশ করবে
            } catch (error) {
                console.error(error);
                alert("Failed to delete content.");
            }
        }
    };

   
    const addEpisodeField = () => {
        setEpisodes([...episodes, { title: '', episodeNumber: episodes.length + 1, season: 1, file: null }]);
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
        formData.append('thumbnail', thumbnail);

        if (activeTab === 'movie') {
            formData.append('video', singleVideo);
        } else {
            episodes.forEach((ep) => {
                if(ep.file) formData.append('seriesVideos', ep.file);
            });
            const episodeInfo = episodes.map(ep => ({
                title: ep.title,
                episodeNumber: ep.episodeNumber,
                season: ep.season
            }));
            formData.append('episodeData', JSON.stringify(episodeInfo));
        }

        try {
            await axios.post('http://localhost:5000/api/movies', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
                <h2 className="form-header">Upload New Content</h2>
                
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
                        <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Thumbnail Image</label>
                        <input type="file" onChange={e => setThumbnail(e.target.files[0])} required />
                    </div>

                    <div style={{marginBottom: '20px', background: '#252525', padding: '10px', borderRadius: '8px'}}>
                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'10px'}}>
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{transform:'scale(1.5)'}} />
                            Add to 🔥 Featured Slider
                        </label>
                    </div>

                    {activeTab === 'movie' && (
                        <div className="file-input-wrapper" style={{borderColor: '#e50914'}}>
                            <label style={{color:'#e50914', fontWeight:'bold'}}>Video File</label>
                            <input type="file" onChange={e => setSingleVideo(e.target.files[0])} required />
                        </div>
                    )}

                    {activeTab === 'series' && (
                        <div>
                            {episodes.map((ep, index) => (
                                <div key={index} className="episode-card">
                                    <h4 style={{margin:'0 0 10px 0', color:'#e50914'}}>Ep {index + 1}</h4>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <input className="modern-input" placeholder="Title" value={ep.title} onChange={e => handleEpisodeChange(index, 'title', e.target.value)} />
                                        <input className="modern-input" type="number" placeholder="No." value={ep.episodeNumber} onChange={e => handleEpisodeChange(index, 'episodeNumber', e.target.value)} style={{width:'80px'}} />
                                    </div>
                                    <input type="file" onChange={e => handleEpisodeChange(index, 'file', e.target.files[0])} required />
                                </div>
                            ))}
                            <button type="button" onClick={addEpisodeField} className="add-ep-btn">+ Add Episode</button>
                        </div>
                    )}

                    <button type="submit" className="upload-btn" disabled={uploading}>
                        {uploading ? 'Uploading...' : '🚀 Publish Now'}
                    </button>
                </form>
            </div>

            
            <div className="manage-container">
                <h2 className="form-header" style={{marginTop: '50px'}}>Manage Content</h2>

                
                <h3 className="section-title">🎬 Movies List</h3>
                <div className="content-list">
                    {movieList.map(item => (
                        <div key={item._id} className="content-item">
                            <img src={`http://localhost:5000/uploads/${item.thumbnailUrl}`} alt="" className="item-thumb"/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{new Date(item.releaseDate).getFullYear()} • {item.genre}</span>
                            </div>
                            
                            <div className="action-buttons">
                        
                                <label className="featured-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={item.isFeatured} 
                                        onChange={() => toggleFeatured(item._id, item.isFeatured)} 
                                    />
                                    <span className="slider round"></span>
                                    <span className="label-text">{item.isFeatured ? '🔥 Featured' : 'Normal'}</span>
                                </label>

                          
                                <button onClick={() => handleDelete(item._id)} className="delete-btn" title="Delete Movie">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {movieList.length === 0 && <p style={{color:'#666'}}>No movies found.</p>}
                </div>

               
                <h3 className="section-title" style={{marginTop: '30px', color: '#7d2ae8'}}>📺 Web Series List</h3>
                <div className="content-list">
                    {seriesList.map(item => (
                        <div key={item._id} className="content-item" style={{borderColor: '#7d2ae8'}}>
                            <img src={`http://localhost:5000/uploads/${item.thumbnailUrl}`} alt="" className="item-thumb"/>
                            <div className="item-info">
                                <h4>{item.title}</h4>
                                <span>{item.episodes?.length || 0} Episodes • {item.genre}</span>
                            </div>
                            
                            <div className="action-buttons">
                                <label className="featured-toggle">
                                    <input 
                                        type="checkbox" 
                                        checked={item.isFeatured} 
                                        onChange={() => toggleFeatured(item._id, item.isFeatured)} 
                                    />
                                    <span className="slider round"></span>
                                    <span className="label-text">{item.isFeatured ? '🔥 Featured' : 'Normal'}</span>
                                </label>

                        
                                <button onClick={() => handleDelete(item._id)} className="delete-btn" title="Delete Series">
                                    🗑️
                                </button>
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