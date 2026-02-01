import React, { useState } from 'react';
import api from '../services/api';
import {
  FaBell,
  FaUser,
  FaHistory,
  FaCog
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || 'Donor'}
            </h1>
            <p className="opacity-90">Blood Donor Dashboard</p>
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
              { key: 'alerts', label: 'Alerts', icon: <FaBell /> },
              { key: 'profile', label: 'Profile', icon: <FaUser /> },
              { key: 'history', label: 'History', icon: <FaHistory /> },
              { key: 'settings', label: 'Settings', icon: <FaCog /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 flex items-center justify-center space-x-2 font-medium ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary-600 text-primary-600'
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
          {activeTab === 'alerts' && (
            <div className="text-center py-10">
              <GiBlood className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Emergency Alerts
              </h2>
              <p className="text-gray-600">
                No emergency alert APIs are connected yet.
              </p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="text-center py-10">
              <FaUser className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Profile data API not connected.
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-10">
              <FaHistory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Response history API not connected.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Test Notification
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send a test notification to your registered email and phone.
                </p>
                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending...' : 'Send Test Notification'}
                </button>
              </div>

              <div className="p-4 border rounded-lg text-sm text-gray-600">
                <p><strong>Status:</strong> System running</p>
                <p><strong>API Connected:</strong> Test Notification only</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
