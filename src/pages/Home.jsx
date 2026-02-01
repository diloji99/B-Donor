import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaBell, FaHeartbeat, FaTint, FaHandsHelping, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import b1 from '../assets/b1.jpg';
import b2 from '../assets/b2.jpg';
import b3 from '../assets/b3.jpg';

const Home = () => {
  const navigate = useNavigate();
  const emergencyRef = useRef(null);

  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [highlight, setHighlight] = useState(false);

  const images = [b1, b2, b3];

  // Fetch requests
  useEffect(() => {
    api.get('/requests')
      .then(res => setRequests(res.data || []))
      .catch(err => console.error(err));
  }, []);

  // Carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const viewResponses = async (requestId) => {
    const res = await api.get(`/responses/request/${requestId}`);
    setResponses(prev => ({ ...prev, [requestId]: res.data }));
  };

  const closeRequest = async (id) => {
    await api.put(`/requests/${id}/close`);
    const res = await api.get('/requests');
    setRequests(res.data);
  };

  const openRequestCount = requests.filter(
    r => r?.status?.toLowerCase() === 'open'
  ).length;

  const handleBellClick = () => {
    emergencyRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-lg px-6 py-4 flex justify-between items-center border-b border-red-100">
        <div className="flex items-center gap-3">
          <FaHeartbeat className="text-3xl text-red-600 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
            B Donor
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Bell Button */}
          <button
            onClick={handleBellClick}
            className="relative p-3 rounded-full bg-red-50 hover:bg-red-100 transition-all duration-300 group shadow-md"
            aria-label="Emergency notifications"
          >
            <FaBell className="text-xl text-red-600 group-hover:scale-110 transition-transform" />
            {openRequestCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                {openRequestCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-8 md:py-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Carousel */}
          <div className="lg:w-1/2 w-full">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={images[currentSlide]}
                  alt="Blood Donation"
                  className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCurrentSlide((currentSlide - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setCurrentSlide((currentSlide + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-lg text-center border border-red-100">
                <FaTint className="text-red-500 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{requests.length}</p>
                <p className="text-sm text-gray-600">Active Requests</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg text-center border border-red-100">
                <FaHandsHelping className="text-red-500 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{openRequestCount}</p>
                <p className="text-sm text-gray-600">Urgent Needs</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg text-center border border-red-100">
                <FaHeartbeat className="text-red-500 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-8 shadow-2xl border border-red-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Our Lifesaving Community</h2>
              <p className="text-gray-600 mb-8">Every drop counts. Be someone's miracle today.</p>
              
              <div className="space-y-6">
                <button
                  onClick={() => navigate('/donor/login')}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FaTint className="text-xl" />
                    Become a Donor
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                <button
                  onClick={() => navigate('/admin/login')}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-600 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <FaHandsHelping className="text-xl" />
                    Admin Portal
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-red-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Why Donate?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> One donation can save up to 3 lives</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Regular donors receive health benefits</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Join a community of heroes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Requests */}
      <section
        ref={emergencyRef}
        className={`max-w-7xl mx-auto px-4 py-8 md:py-12 transition-all duration-500 ${
          highlight ? 'ring-4 ring-red-300 bg-gradient-to-r from-red-50 to-white rounded-3xl' : ''
        }`}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-red-50 px-6 py-3 rounded-full mb-4">
            <FaBell className="text-red-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              Emergency Blood Requests
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These patients urgently need your help. Your donation could be their lifeline.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-red-200">
            <FaHeartbeat className="text-5xl text-red-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 font-medium">No emergency requests at the moment</p>
            <p className="text-gray-400 mt-2">Check back soon or register as a donor</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-red-100 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-red-50 px-4 py-2 rounded-full">
                      <span className="text-2xl font-bold text-red-700">{req.bloodGroup}</span>
                      <span className="text-gray-600 ml-2">Blood Type</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      req.status?.toLowerCase() === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <FaTint className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Units Required</p>
                        <p className="text-xl font-bold text-gray-800">{req.units} Units</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <FaHandsHelping className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-800">{req.location}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">{req.description}</p>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewResponses(req.id)}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 px-4 rounded-lg font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          View Responses
                        </button>
                       
                      </div>
                    </div>
                  </div>
                </div>

                {responses[req.id] && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Donor Responses:</h4>
                    <div className="space-y-2">
                      {responses[req.id].map(resp => (
                        <div key={resp.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-800">Donor #{resp.donorId}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            resp.responseStatus === 'Available' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {resp.responseStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center bg-gradient-to-r from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <FaHeartbeat className="text-4xl text-red-600 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800">Every Drop Saves a Life</h3>
            <p className="text-gray-600 max-w-2xl">
              Join thousands of heroes who have made a difference. Your blood donation can give someone another chance at life.
            </p>
            <div className="flex items-center gap-6 mt-4 text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                100% Safe Process
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Certified Centers
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                24/7 Emergency Support
              </span>
            </div>
            <p className="text-red-700 font-semibold mt-6 text-lg">
              ❤️ Donate blood today, save a life tomorrow
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;