import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUser, FaLock, FaQuestionCircle } from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';

const DonorLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    universityId: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.universityId || !form.password) {
      alert('Please enter University ID and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/Auth/login/donor', {
        universityId: form.universityId,
        password: form.password
      });

      // ✅ Save JWT
      localStorage.setItem('token', res.data.token);

      alert('Login successful');
      navigate('/donor/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // You can implement the forgot password logic here
    // For example, navigate to a forgot password page or show a modal
    const universityId = prompt('Please enter your University ID to reset your password:');
    if (universityId) {
      // Here you would typically make an API call to send reset password email
      alert(`Password reset instructions will be sent to the email associated with ${universityId}`);
      // Alternatively, navigate to a dedicated forgot password page:
      // navigate('/donor/forgot-password');
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
            Donor Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your donor dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* University ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University ID
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="universityId"
                  type="text"
                  value={form.universityId}
                  onChange={handleChange}
                  placeholder="U123456"
                  className="w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              
              </div>
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
              {loading ? 'Logging in...' : 'Login as Donor'}
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-600">
              Not registered yet?{' '}
              <Link to="/donor/register" className="text-red-600 font-semibold hover:underline">
                Register as Donor
              </Link>
            </p>

          </form>
           
          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t text-center text-sm">
            <Link to="/" className="text-red-600 hover:underline">
              ← Back to Home
            </Link>
            <span className="mx-2 text-gray-300">|</span>
            <Link to="/admin/login" className="text-red-600 hover:underline">
              Admin Login →
            </Link>
          </div>
           <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm p-3 text-center text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <FaQuestionCircle className="text-xs" />
                  Forgot Password?
            </button>

        </div>
      </div>
    </div>
  );
};

export default DonorLogin;
