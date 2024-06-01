import Account from './pages/Account.jsx';
import Home from './pages/Home.jsx';
import Inventory from './pages/Inventory.jsx';
import Login from './pages/Login.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import NewOrder from './pages/NewOrder.jsx';
import Transactions from './pages/Transactions.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import DynamicQRCodeGenerator from './pages/QRCode.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prod" element={<ProductsPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/:shopName/:orderNumber" element={<OrderDetails />} />
        <Route path="/qr" element={<DynamicQRCodeGenerator />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
