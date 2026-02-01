import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DonorLogin from './pages/DonorLogin';
import DonorRegister from './pages/DonorRegister';
import DonorDashboard from './pages/DonorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/donor/login" element={<DonorLogin />} />
          <Route path="/donor/register" element={<DonorRegister />} />
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;