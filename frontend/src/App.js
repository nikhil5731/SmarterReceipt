import Home from './pages/Home.js';
import Login from './pages/Login.js';
import ProductsPage from './pages/ProductsPage.js';
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
