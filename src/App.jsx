import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './componants/Header/Navbar';
import ImageGallary from './componants/Home/Galleryimg/ImageGallary';
import ImageDetail from './componants/Home/Gallerydetail/ImageDetail';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path='/' element={<ImageGallary />} />
          <Route path='/:id' element={<ImageDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
