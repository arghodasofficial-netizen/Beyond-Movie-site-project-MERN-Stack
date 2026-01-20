// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import Home from './pages/Home';
import AddMovie from './pages/AddMovie';
import MoviePlayer from './pages/MoviePlayer';
import FilterPage from './pages/FilterPage';
import Login from './pages/Login'; 


const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin");
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <div style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <AddMovie />
              </ProtectedRoute>
            } 
          />
          <Route path="/movie/:id" element={<MoviePlayer />} />
          <Route path="/search/:query" element={<FilterPage />} />
          <Route path="/category/:genre" element={<FilterPage />} />
          <Route path="/release/:year" element={<FilterPage />} />
        </Routes>
      </div>

      <Footer /> 
    </BrowserRouter>
  );
};

export default App;