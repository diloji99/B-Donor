import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const DonorRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    universityId: '',
    bloodGroup: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { name, universityId, bloodGroup, phoneNumber, email, password, confirmPassword } = form;

    if (!name || !universityId || !bloodGroup || !phoneNumber || !email || !password || !confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/Donor/register', {
        name,
        universityId,
        bloodGroup,
        phoneNumber,
        email,
        password
      });

      alert('Donor registered successfully!');
      navigate('/donor/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 21s-6-4.35-9-8.35a5.4 5.4 0 018.1-7.1L12 6.6l.9-1.05a5.4 5.4 0 018.1 7.1C18 16.65 12 21 12 21z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Become a Blood Donor</h1>
          <p className="text-gray-600 mt-2">Join our community of lifesavers</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">

          <Input
            label="Full Name *"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="University ID *"
            name="universityId"
            placeholder="2018/ICT/XX"
            value={form.universityId}
            onChange={handleChange}
          />

          <Input
            label="Phone Number *"
            name="phoneNumber"
            placeholder="+94 7X XXX XXXX"
            value={form.phoneNumber}
            onChange={handleChange}
          />

          <Input
            label="Email Address *"
            name="email"
            type="email"
            placeholder="donor@example.com"
            value={form.email}
            onChange={handleChange}
          />

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Group *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {bloodGroups.map(bg => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setForm({ ...form, bloodGroup: bg })}
                  className={`py-3 rounded-lg border ${
                    form.bloodGroup === bg
                      ? 'bg-red-100 border-red-500 text-red-700 font-semibold'
                      : 'border-gray-300 hover:bg-red-50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <Input
            label="Password *"
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />

          <Input
            label="Confirm Password *"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register as Donor'}
          </button>

          {/* Login */}
          <p className="text-center text-gray-600 text-sm">
            Already registered?{' '}
            <Link to="/donor/login" className="text-red-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

/* 🔹 Reusable Input Component */
const Input = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
    />
  </div>
);

export default DonorRegister;
