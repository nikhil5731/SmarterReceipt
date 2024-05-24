import Account from './pages/Account.jsx';
import Home from './pages/Home.jsx';
import Inventory from './pages/Inventory.jsx';
import Login from './pages/Login.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prod" element={<ProductsPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
