import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Navigation Component
const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-teal-500 to-blue-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-white font-bold text-xl">Maldives Travel Hub</span>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-teal-600"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const OfferCard = ({ offer }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // If dateString is already in ISO format with T or contains +
    // Example: 2025-09-10T00:00:00+00:00
    if (dateString.includes('T') || dateString.includes('+')) {
      return new Date(dateString).toLocaleDateString();
    }
    
    // If dateString is just a date string like "2025-09-10"
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 offer-card" data-testid="offer-card">
      <div className="relative h-48 sm:h-64">
        <img
          src={offer.images?.[0] || "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
          alt={offer.title}
          className="w-full h-full object-cover"
          data-testid="offer-image"
        />
        <div className="absolute top-0 right-0 bg-teal-500 text-white px-3 py-1 m-2 rounded-md" data-testid="offer-price">
          ${offer.price}
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full p-3">
          <span className="text-white text-xs uppercase font-semibold tracking-wider bg-blue-500 px-2 py-1 rounded" data-testid="offer-category">
            {offer.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1" data-testid="offer-title">{offer.title}</h3>
        <p className="text-gray-600 text-sm mb-2" data-testid="offer-destination">
          <span className="font-medium text-gray-800">Destination:</span> {offer.destination}
        </p>
        <p className="text-gray-600 text-sm mb-2" data-testid="offer-dates">
          <span className="font-medium text-gray-800">Dates:</span>{" "}
          {formatDate(offer.travel_dates?.start_date)} to{" "}
          {formatDate(offer.travel_dates?.end_date)}
        </p>
        <p className="text-gray-600 text-sm mb-4" data-testid="offer-company">
          <span className="font-medium text-gray-800">Company:</span> {offer.company_name}
        </p>
        <div className="flex justify-between items-center">
          <a
            href={offer.company_website}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            data-testid="book-now-button"
          >
            Book Now
          </a>
          <button 
            className="text-teal-500 hover:text-teal-700"
            onClick={() => window.open(`/offers/${offer.id}`, '_blank')}
            data-testid="view-details-button"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterBar = ({ onFilterChange }) => {
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleApplyFilters = () => {
    onFilterChange({
      destination,
      category,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      sortBy,
      sortOrder,
    });
  };

  const handleClearFilters = () => {
    setDestination("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("created_at");
    setSortOrder("desc");
    onFilterChange({
      destination: "",
      category: "",
      minPrice: null,
      maxPrice: null,
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-bold mb-4">Filter Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g. Paris, Japan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Min"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="travel_dates.start_date">Travel Date</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-md"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Home Page Component
const Home = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    destination: "",
    category: "",
    minPrice: null,
    maxPrice: null,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        let url = `${API}/offers?`;
        
        if (filters.destination) {
          url += `destination=${filters.destination}&`;
        }
        if (filters.category) {
          url += `category=${filters.category}&`;
        }
        if (filters.minPrice) {
          url += `min_price=${filters.minPrice}&`;
        }
        if (filters.maxPrice) {
          url += `max_price=${filters.maxPrice}&`;
        }
        if (filters.sortBy) {
          url += `sort_by=${filters.sortBy}&sort_order=${filters.sortOrder}`;
        }
        
        const response = await axios.get(url);
        setOffers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setError("Failed to load travel offers. Please try again later.");
        setLoading(false);
      }
    };

    fetchOffers();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1596825858871-61cce1b13e0a?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Travel"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-teal-900/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
            Explore the best travel offers from top Maldivian travel companies,
            all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advertisement Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg mb-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">Special Promotion!</h3>
              <p className="text-white">Get 10% off on selected destinations. Limited time offer.</p>
            </div>
            <button className="bg-white text-orange-500 hover:bg-gray-100 font-bold py-2 px-6 rounded-full">
              Learn More
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Offers Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No travel offers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later for new offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {/* Advertisement Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Join Our Travel Rewards Program
              </h3>
              <p className="text-gray-600">
                Earn points on every booking and get exclusive access to special offers.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1501426026826-31c667bdf23d?q=80&w=1872&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Travel Rewards"
              className="w-full md:w-72 h-36 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Login Component
const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${API}/admin/login`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("accessToken", response.data.access_token);
      window.location.href = "/admin/dashboard";
    } catch (error) {
      setError("Invalid username or password");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAdmin = async () => {
    try {
      await axios.post(`${API}/admin/create-default-admin`);
      alert("Default admin created successfully! Username: admin, Password: admin123");
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? "bg-teal-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button 
            className="text-sm text-teal-600 hover:text-teal-800"
            onClick={createDefaultAdmin}
          >
            Create Default Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/admin";
      return;
    }

    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${API}/offers`);
        setOffers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setError("Failed to load travel offers");
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/admin";
  };

  const handleDelete = async (offerId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`${API}/admin/offers/${offerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the deleted offer from the state
      setOffers(offers.filter(offer => offer.id !== offerId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("Failed to delete offer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                data-testid="admin-logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showAddForm ? (
            <AddOfferForm 
              onClose={() => setShowAddForm(false)} 
              onSuccess={(newOffer) => {
                setOffers([newOffer, ...offers]);
                setShowAddForm(false);
              }}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Travel Offers</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                  data-testid="add-offer-button"
                >
                  Add New Offer
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No travel offers found. Add your first offer!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destination
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {offer.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {offer.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${offer.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {offer.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {offer.company_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-4">
                              <button 
                                className="text-teal-600 hover:text-teal-900"
                                data-testid="edit-offer-button"
                              >
                                Edit
                              </button>
                              {showDeleteConfirm === offer.id ? (
                                <div className="flex items-center space-x-2">
                                  <button 
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleDelete(offer.id)}
                                    data-testid="confirm-delete-button"
                                  >
                                    Confirm
                                  </button>
                                  <button 
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowDeleteConfirm(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => setShowDeleteConfirm(offer.id)}
                                  data-testid="delete-offer-button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Offer Form Component
const AddOfferForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    price: "",
    category: "",
    company_name: "",
    company_website: "",
    start_date: "",
    end_date: "",
    image_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      
      const offerData = {
        title: formData.title,
        destination: formData.destination,
        description: formData.description,
        price: parseFloat(formData.price),
        travel_dates: {
          start_date: formData.start_date,
          end_date: formData.end_date
        },
        company_name: formData.company_name,
        company_website: formData.company_website,
        category: formData.category,
        images: formData.image_url ? [formData.image_url] : []
      };

      const response = await axios.post(`${API}/admin/offers`, offerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      onSuccess(response.data);
    } catch (error) {
      console.error("Error creating offer:", error);
      setError("Failed to create offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Add New Travel Offer</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          &times; Close
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-offer-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="title-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="destination-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="price-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="category-input"
            >
              <option value="">Select a category</option>
              <option value="Adventure">Adventure</option>
              <option value="Beach">Beach</option>
              <option value="City Break">City Break</option>
              <option value="Cultural">Cultural</option>
              <option value="Family">Family</option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Road Trip">Road Trip</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="start-date-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="end-date-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="company-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Website
            </label>
            <input
              type="url"
              name="company_website"
              value={formData.company_website}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              data-testid="company-website-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            data-testid="image-url-input"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to use a default image</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            data-testid="description-input"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md text-white ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            }`}
            data-testid="submit-offer-button"
          >
            {loading ? "Saving..." : "Add Offer"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
