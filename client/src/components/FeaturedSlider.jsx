// src/components/FeaturedSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import '../App.css'; 

const FeaturedSlider = ({ movies }) => {
  
  const featuredMovies = movies.filter(movie => movie.isFeatured);

  if (featuredMovies.length === 0) return null;

  return (
    <div style={{ padding: '40px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e50914' }}>🔥 Trending Now</h2>
      
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 50,       
          stretch: 0,
          depth: 100,       
          modifier: 1,
          slideShadows: true,
        }}
        autoplay={{
          delay: 2500,      
          disableOnInteraction: false,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
      >
        {featuredMovies.map((movie) => (
          <SwiperSlide key={movie._id} style={{ width: '300px', height: '400px' }}>
            <div className="slider-card">
              <img 
                src={`https://beyond-movie-site-project-mern-stack.onrender.com/uploads/${movie.thumbnailUrl}`} 
                alt={movie.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              />
              <div className="slider-info">
                <h3>{movie.title}</h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedSlider;