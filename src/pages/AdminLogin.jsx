import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUserShield, FaLock } from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Auth/login/admin', {
        username: form.username,
        password: form.password
      });

      // ✅ Save admin JWT
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'admin');

      alert('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <GiBlood className="h-16 w-16 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the admin dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <FaUserShield className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Admin username"
                  className="w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>

            {/* Back */}
            <p className="text-center text-sm text-gray-600">
              <Link to="/" className="text-red-600 font-semibold hover:underline">
                ← Back to Home
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
