import React, { useState } from 'react';
import api from '../services/api';
import {
  FaUsers,
  FaBell,
  FaChartLine,
  FaPlusCircle
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [donorForm, setDonorForm] = useState({
    name: '',
    universityId: '',
    bloodGroup: '',
    phoneNumber: '',
    email: ''
  });

  /* ------------------ API HANDLERS ------------------ */

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/Donor/register', donorForm);
      toast.success('Donor registered successfully!');
      setDonorForm({
        name: '',
        universityId: '',
        bloodGroup: '',
        phoneNumber: '',
        email: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to register donor');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setLoading(true);
      await api.post('/Donor/test-notification');
      toast.success('Test notification sent successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-600 to-secondary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90">System Administration</p>
          </div>
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {[
              { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
              { key: 'register', label: 'Register Donor', icon: <FaUsers /> },
              { key: 'notify', label: 'Test Notification', icon: <FaBell /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 flex items-center justify-center space-x-2 font-medium ${
                  activeTab === tab.key
                    ? 'border-b-2 border-secondary-600 text-secondary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-10">
              <GiBlood className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Admin System Ready
              </h2>
              <p className="text-gray-600">
                Only donor registration and test notification APIs are connected.
              </p>
            </div>
          )}

          {activeTab === 'register' && (
            <form
              onSubmit={handleRegisterDonor}
              className="max-w-md mx-auto space-y-4"
            >
              <h2 className="text-xl font-bold mb-4">Register New Donor</h2>

              <input
                type="text"
                placeholder="Name"
                value={donorForm.name}
                onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                required
                className="input-field"
              />

              <input
                type="text"
                placeholder="University ID"
                value={donorForm.universityId}
                onChange={(e) => setDonorForm({ ...donorForm, universityId: e.target.value })}
                required
                className="input-field"
              />

              <select
                value={donorForm.bloodGroup}
                onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                required
                className="input-field"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <input
                type="text"
                placeholder="Phone Number"
                value={donorForm.phoneNumber}
                onChange={(e) => setDonorForm({ ...donorForm, phoneNumber: e.target.value })}
                required
                className="input-field"
              />

              <input
                type="email"
                placeholder="Email"
                value={donorForm.email}
                onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                required
                className="input-field"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full"
              >
                {loading ? 'Registering...' : 'Register Donor'}
              </button>
            </form>
          )}

          {activeTab === 'notify' && (
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-xl font-bold">Test Notification</h2>
              <p className="text-sm text-gray-600">
                Send a test email/SMS to verify notification services.
              </p>
              <button
                onClick={handleTestNotification}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Test Notification'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
