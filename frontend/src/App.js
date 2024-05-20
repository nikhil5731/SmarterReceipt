import './App.css';
import Home from './Home.js';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
