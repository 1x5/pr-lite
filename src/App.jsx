import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrderViewScreen from './pages/OrderViewScreen';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:id" element={<OrderViewScreen />} />
      </Routes>
    </Router>
  );
}

export default App; 