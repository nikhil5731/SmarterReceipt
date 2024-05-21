import './App.css';
import Home from './Home.js';
import Login from './Login.js';
import ProductsPage from './ProductsPage.js';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prod" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
