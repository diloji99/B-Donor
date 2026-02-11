import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaBell, FaPlusCircle, FaSignOutAlt, FaSearch, FaEye, FaTimes, FaTrash, FaFilter } from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /* ------------------ STATES ------------------ */
  const [emergencyForm, setEmergencyForm] = useState({
    bloodGroup: '',
    unitsRequired: '',
    location: '',
    description: ''
  });

  const [testNotificationForm, setTestNotificationForm] = useState({
    email: '',
    phoneNumber: ''
  });

  const [emergencies, setEmergencies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');

  /* ------------------ HANDLERS ------------------ */
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const fetchEmergencies = async () => {
    try {
      const response = await api.get('/Donor/emergencies');
      setEmergencies(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load emergencies');
    }
  };

  const handleCreateEmergency = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/Emergency/create', {
        bloodGroup: emergencyForm.bloodGroup,
        unitsRequired: Number(emergencyForm.unitsRequired),
        location: emergencyForm.location,
        description: emergencyForm.description
      });

      toast.success('Emergency created successfully!');
      setEmergencyForm({
        bloodGroup: '',
        unitsRequired: '',
        location: '',
        description: ''
      });
      setShowCreateModal(false);
      fetchEmergencies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create emergency');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/Emergency/test-notifications', testNotificationForm);
      toast.success('Test notification sent successfully!');
      setTestNotificationForm({
        email: '',
        phoneNumber: ''
      });
      setShowNotificationsModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRequest = async (id) => {
    try {
      await api.put(`/Emergency/${id}/close`);
      toast.success('Emergency closed successfully!');
      fetchEmergencies();
    } catch (error) {
      toast.error('Failed to close emergency');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this emergency?')) {
      try {
        await api.delete(`/Emergency/${id}`);
        toast.success('Emergency deleted successfully!');
        fetchEmergencies();
      } catch (error) {
        toast.error('Failed to delete emergency');
      }
    }
  };

  const handleViewResponses = (id) => {
    navigate(`/admin/responses/${id}`);
  };

  /* ------------------ EFFECTS ------------------ */
  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------ STATS ------------------ */
  const stats = {
    totalEmergencies: emergencies.length,
    activeEmergencies: emergencies.filter(e => e.status === 'active' || e.status === undefined).length,
    closedEmergencies: emergencies.filter(e => e.status === 'closed').length
  };

  /* ------------------ BLOOD GROUP FILTERS ------------------ */
  const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  /* ------------------ FILTERED EMERGENCIES ------------------ */
  const filteredEmergencies = emergencies.filter(emergency => {
    // Search filter
    const matchesSearch = emergency.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergency.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergency.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (activeFilter === 'active') matchesStatus = emergency.status === 'active' || emergency.status === undefined;
    if (activeFilter === 'closed') matchesStatus = emergency.status === 'closed';
    
    // Blood group filter
    let matchesBloodGroup = true;
    if (bloodGroupFilter !== 'all') {
      matchesBloodGroup = emergency.bloodGroup === bloodGroupFilter;
    }
    
    return matchesSearch && matchesStatus && matchesBloodGroup;
  });

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar - Exact match to image */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl mt-1">
                <GiBlood className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Blood Emergency Dashboard</h1>
                <p className="text-white/90 mt-1">Manage emergency blood donation requests and responses</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Search Bar - Exact match to image */}
        <div className="mb-10">
          <div className="relative max-w-3xl mx-auto">
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Stats Tabs and Buttons - Exact match to image */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            {/* Tabs - Exact layout from image */}
            <div className="flex gap-8 border-b border-gray-300 pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-lg font-semibold px-1 pb-3 relative ${activeFilter === 'all' ? 'text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All {stats.totalEmergencies}
                {activeFilter === 'all' && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-red-700 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`text-lg font-semibold px-1 pb-3 relative ${activeFilter === 'active' ? 'text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Active {stats.activeEmergencies}
                {activeFilter === 'active' && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-red-700 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveFilter('closed')}
                className={`text-lg font-semibold px-1 pb-3 relative ${activeFilter === 'closed' ? 'text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Closed {stats.closedEmergencies}
                {activeFilter === 'closed' && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-red-700 rounded-t-full"></div>
                )}
              </button>
            </div>
            
            {/* Buttons - Exact match to image */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow"
              >
                <FaPlusCircle className="text-lg" />
                Create Emergency
              </button>
              
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow"
              >
                <FaBell className="text-lg" />
                Test Notifications
              </button>
            </div>
          </div>

          {/* Blood Group Filter Section */}
          <div className="mb-8">
            <div className="flex-col items-center gap-3 mb-4">
              <FaFilter className="text-gray-500" />
              <span className="font-semibold text-gray-700">Filter by Blood Group:</span>
            </div>
            <div className="flex-col gap-3">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setBloodGroupFilter(group)}
                  className={`px-5 py-2.5 rounded-lg font-semibold ${group === bloodGroupFilter 
                    ? group === 'all' 
                      ? 'bg-red-600 text-white' 
                      : group.includes('+') 
                        ? 'bg-red-600 text-white' 
                        : 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {group === 'all' ? 'All Blood Groups' : group}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Cards Grid - Exact match to image */}
        {filteredEmergencies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <GiBlood className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-500 mb-3">No emergencies found</h3>
            <p className="text-gray-400 text-lg mb-8">
              {bloodGroupFilter !== 'all' 
                ? `No ${bloodGroupFilter} emergencies found with current filters`
                : 'Try creating a new emergency or adjust your search'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaPlusCircle />
              Create Emergency
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEmergencies.map((emergency, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className=" flex justify-between p-6">
                  {/* Header - Exact match to image */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl ${emergency.bloodGroup?.includes('+') ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {emergency.bloodGroup}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500 mb-1">ID: #{emergency.id || emergency._id || index + 1}</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${emergency.status === 'active' || emergency.status === undefined ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {emergency.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(emergency.createdAt || Date.now()).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid - 2x2 layout exactly like image */}
                  <div className="flex gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Units Required</div>
                      <div className="font-bold text-xl text-gray-800">{emergency.unitsRequired || 1} units</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</div>
                      <div className="font-bold text-xl text-gray-800 truncate">{emergency.location || 'Colombo'}</div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</div>
                      <div className="font-bold text-xl text-gray-800">{emergency.responses || 0}</div>
                    </div>
                  </div>

                  {/* Action Buttons - Exact match to image */}
                  <div className="gap-2 pt-6  border-t border-gray-100">
                      <div className='p-1'>
                    <button
                      onClick={() => handleViewResponses(emergency.id || emergency._id || index + 1)}
                      className="flex-1 w-full p-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FaEye />
                      View Responses
                    </button>
                        </div>
                            <div  className='p-1'>
                    <button
                      onClick={() => handleCloseRequest(emergency.id || emergency._id || index + 1)}
                      className="flex-1 w-full p-3 flex items-center justify-center gap-2 px-3 py-2.5 border text-gray-600 bg-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <FaTimes />
                      Close Request
                    </button>
                        </div>
                            <div  className='p-1'>
                    <button
                      onClick={() => handleDeleteRequest(emergency.id || emergency._id || index + 1)}
                      className="flex-1 w-full p-3 flex items-center justify-center gap-2 px-3 py-2.5  order text-red-600 bg-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <FaTrash />
                      Delete
                    </button>
                        </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Emergency Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Emergency</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateEmergency} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={emergencyForm.bloodGroup}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, bloodGroup: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Units Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 5"
                    value={emergencyForm.unitsRequired}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, unitsRequired: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Hospital name or address"
                    value={emergencyForm.location}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Provide details about the emergency..."
                    value={emergencyForm.description}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Emergency...
                    </span>
                  ) : (
                    'Create Emergency'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Test Notifications</h2>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleTestNotification} className="p-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <FaBell className="text-lg text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    This will send test notifications to the provided email and phone number to verify the notification system is working correctly.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="test@example.com"
                    value={testNotificationForm.email}
                    onChange={(e) => setTestNotificationForm({ ...testNotificationForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={testNotificationForm.phoneNumber}
                    onChange={(e) => setTestNotificationForm({ ...testNotificationForm, phoneNumber: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Notifications...
                    </span>
                  ) : (
                    'Send Test Notifications'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationsModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
