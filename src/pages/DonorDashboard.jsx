import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FaTint, FaMapMarkerAlt, FaClock, FaHeart, FaBell, FaAmbulance,
  FaCheckCircle, FaUsers, FaExclamationTriangle, FaSignOutAlt,
  FaFilter
} from 'react-icons/fa';
import { GiHeartBeats } from 'react-icons/gi';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(new Set());
  const [stats, setStats] = useState({
    totalResponses: 0,
    requestsAccepted: 0,
    newRequests: 0,
    myResponses: 0
  });
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const donor = {
    name: 'Donor',
    bloodGroup: 'A+',
  };

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Donor/emergencies');
      setEmergencies(res.data || []);
      applyBloodGroupFilter(res.data || [], bloodGroupFilter);
      calculateStats(res.data || []);
    } catch (err) {
      toast.error('Failed to load emergency requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyBloodGroupFilter = (data, filter) => {
    if (filter === 'all') {
      setFilteredEmergencies(data);
    } else {
      const filtered = data.filter(req => 
        req.bloodGroup === filter || req.bloodGroup === donor.bloodGroup
      );
      setFilteredEmergencies(filtered);
    }
  };

  const calculateStats = (emergenciesData) => {
    if (!emergenciesData || emergenciesData.length === 0) {
      setStats({
        totalResponses: 0,
        requestsAccepted: 0,
        newRequests: 0,
        myResponses: 0
      });
      return;
    }

    // Count my responses (from local state)
    const myResponsesCount = accepted.size;
    
    // Count new requests (not responded yet)
    const newRequestsCount = filteredEmergencies.filter(req => !accepted.has(req.id)).length;
    
    // Calculate total responses
    const totalResponses = myResponsesCount;
    
    setStats({
      totalResponses,
      requestsAccepted: myResponsesCount,
      newRequests: newRequestsCount,
      myResponses: myResponsesCount
    });
  };

  const toggleResponse = async (id) => {
    try {
      const isCurrentlyAccepted = accepted.has(id);
      
      if (!isCurrentlyAccepted) {
        // Only update frontend state without API call
        setAccepted(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        
        toast.success('Thank you! Response sent successfully');
      } else {
        // Withdraw response (frontend only)
        setAccepted(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        
        toast('Response withdrawn', { icon: '↩️' });
      }
      
    } catch (err) {
      toast.error('Failed to update response');
      console.error(err);
    }
  };

  const handleBloodGroupFilter = (group) => {
    setBloodGroupFilter(group);
    applyBloodGroupFilter(emergencies, group);
    setShowFilter(false);
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate stats when accepted responses or filtered emergencies change
  useEffect(() => {
    if (filteredEmergencies.length > 0) {
      calculateStats(filteredEmergencies);
    }
  }, [accepted, filteredEmergencies]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GiHeartBeats className="text-red-600 text-4xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Donor Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Welcome back, <span className="font-semibold">{donor.name}</span>
                <span className="ml-3 text-red-600 font-medium">
                  <FaTint className="inline mr-1.5" />
                  {donor.bloodGroup}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition">
              <FaBell className="text-lg" />
              Emergency Mode
            </button>

            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center border border-gray-100">
            <div className="flex justify-center mb-3">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaUsers className="text-blue-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalResponses}</h3>
            <p className="text-gray-600 mt-1">Total Responses</p>
            <div className="mt-4 h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all" 
                style={{ width: `${Math.min(stats.totalResponses * 20, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center border border-gray-100">
            <div className="flex justify-center mb-3">
              <div className="bg-green-100 p-4 rounded-full">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.requestsAccepted}</h3>
            <p className="text-gray-600 mt-1">Requests Accepted</p>
            <div className="mt-4 h-1.5 bg-green-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all" 
                style={{ width: `${Math.min(stats.requestsAccepted * 20, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center border border-gray-100">
            <div className="flex justify-center mb-3">
              <div className="bg-pink-100 p-4 rounded-full">
                <FaHeart className="text-red-500 text-3xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">~{stats.requestsAccepted * 3}</h3>
            <p className="text-gray-600 mt-1">Lives Saved</p>
            <p className="text-sm text-gray-500 mt-2">
              Each donation can save up to 3 lives
            </p>
            <div className="mt-4 h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all" 
                style={{ width: `${Math.min(stats.requestsAccepted * 20, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* ALERT BANNER + TABS + FILTER */}
      <section className="max-w-7xl mx-auto px-6 mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="bg-white shadow-sm rounded-lg px-6 py-3 flex items-center gap-3 text-gray-700 font-medium">
          <FaBell className="text-xl" />
          All Alerts <span className="text-blue-600">{filteredEmergencies.length}</span>
        </div>

        <div className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md flex items-center gap-3 flex-1 justify-center w-full sm:w-auto">
          <FaExclamationTriangle className="text-2xl" />
          New Requests <span className="ml-1">{stats.newRequests}</span>
        </div>

        <div className="bg-white shadow-sm rounded-lg px-6 py-3 flex items-center gap-3 text-gray-700 font-medium">
          <FaAmbulance className="text-xl" />
          My Responses <span className="text-blue-600">{stats.myResponses}</span>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`bg-white shadow-sm rounded-lg px-6 py-3 flex items-center gap-3 text-gray-700 font-medium border ${
              bloodGroupFilter !== 'all' ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            <FaFilter className="text-xl" />
            Filter
            {bloodGroupFilter !== 'all' && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {bloodGroupFilter}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowFilter(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border border-gray-100 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-800">Filter by Blood Group</h3>
                  <p className="text-sm text-gray-500 mt-1">Show requests for specific blood types</p>
                </div>
                <div className="p-3 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => handleBloodGroupFilter('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                      bloodGroupFilter === 'all' 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">All Blood Groups</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {emergencies.length} requests
                      </span>
                    </div>
                  </button>
                  
                  <div className="mt-3 mb-2 text-xs font-semibold text-gray-500 px-4">
                    COMPATIBLE WITH YOUR BLOOD TYPE ({donor.bloodGroup})
                  </div>
                  
                  <button
                    onClick={() => handleBloodGroupFilter(donor.bloodGroup)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                      bloodGroupFilter === donor.bloodGroup 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">My Blood Group: {donor.bloodGroup}</span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        {emergencies.filter(req => req.bloodGroup === donor.bloodGroup).length} requests
                      </span>
                    </div>
                  </button>
                  
                  <div className="mt-3 mb-2 text-xs font-semibold text-gray-500 px-4">
                    ALL BLOOD GROUPS
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {bloodGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => handleBloodGroupFilter(group)}
                        className={`px-4 py-3 rounded-lg text-center ${
                          bloodGroupFilter === group 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'hover:bg-gray-50 text-gray-700 border border-gray-100'
                        }`}
                      >
                        <div className="font-bold text-lg">{group}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {emergencies.filter(req => req.bloodGroup === group).length} requests
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 border-t bg-gray-50">
                  <button
                    onClick={() => setShowFilter(false)}
                    className="w-full text-center text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* REQUEST CARDS - Show responded ones first */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading requests...</div>
        ) : filteredEmergencies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow">
            {bloodGroupFilter === 'all' 
              ? 'No emergency requests at the moment'
              : `No ${bloodGroupFilter} blood group requests available`
            }
          </div>
        ) : (
          // Sort: responded first, then others
          [...filteredEmergencies]
            .sort((a, b) => {
              const aResponded = accepted.has(a.id);
              const bResponded = accepted.has(b.id);
              if (aResponded && !bResponded) return -1;
              if (!aResponded && bResponded) return 1;
              return 0;
            })
            .map(req => {
              const isResponded = accepted.has(req.id);

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden border ${
                    isResponded ? 'border-green-200' : 'border-gray-100'
                  }`}
                >
                  {isResponded && (
                    <div className="bg-green-50 px-6 py-2 text-green-700 font-medium flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      You have responded to this request
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                    {/* Left - Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-red-100 p-3 rounded-full">
                          <FaTint className="text-red-600 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-red-600">
                            {req.bloodGroup || donor.bloodGroup}
                            {req.bloodGroup === donor.bloodGroup && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                Your Blood Type
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Request #{req.id}
                            {isResponded && (
                              <span className="ml-2 text-green-600 font-medium">
                                ✓ Responded
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-sm">
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Units Required</p>
                          <p className="text-2xl font-bold">{req.unitsRequired || "min"}</p>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 transition-all"
                              style={{ width: `${Math.min((req.unitsRequired || 1) * 20, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-green-600" />
                            Location
                          </p>
                          <p className="text-lg font-medium">{req.location || 'Jaffna'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {req.createdAt ? formatDate(req.createdAt) : '24/01/2026'}
                          </p>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <FaClock className="text-amber-600" />
                            Distance
                          </p>
                          <p className="text-lg font-medium">~{req.distance || '5.2'} km</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Estimated travel time 15 min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex flex-col gap-3 min-w-[180px]">
                      <button
                        onClick={() => toggleResponse(req.id)}
                        className={`py-3.5 px-8 rounded-xl font-semibold text-white transition shadow-md ${
                          isResponded
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {isResponded ? 'Responded ✓' : 'I Can Help'}
                      </button>

                      <button className="py-3 px-8 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">
                        Not Available
                      </button>

                      <button className="py-3 px-8 border border-blue-300 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <FaMapMarkerAlt />
                        View on Map
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
        )}
      </section>
    </div>
  );
};

export default DonorDashboard;
