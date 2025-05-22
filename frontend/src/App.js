import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
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
              <Link to="/" className="text-white font-bold text-xl">Maldives Travel Hub</Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-teal-600"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Format Date Helper Function
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

// Travel Offer Card Component
const OfferCard = ({ offer }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/offers/${offer.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 offer-card cursor-pointer" 
      data-testid="offer-card"
      onClick={handleViewDetails}
    >
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
        <p className="text-gray-600 text-sm mb-2" data-testid="offer-company">
          <span className="font-medium text-gray-800">Company:</span> {offer.company_name}
        </p>
        <div className="text-center mt-2">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded-md"
            onClick={handleViewDetails}
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

// Offer Detail Page Component
const OfferDetail = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await axios.get(`${API}/offers/${id}`);
        console.log("Offer data received:", response.data);
        setOffer(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offer details:", error);
        setError("Failed to load offer details. Please try again later.");
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error || "Offer not found"}</span>
        </div>
        <div className="mt-4">
          <Link to="/" className="text-teal-600 hover:text-teal-800">
            &larr; Back to all offers
          </Link>
        </div>
      </div>
    );
  }

  console.log("Rendering offer with:", {
    highlights: offer.highlights, 
    inclusions: offer.inclusions, 
    exclusions: offer.exclusions,
    itinerary: offer.itinerary,
    contactInfo: offer.contact_info
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link to="/" className="text-teal-600 hover:text-teal-800">
          &larr; Back to all offers
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-64 sm:h-96">
          <img
            src={offer.images?.[0] || "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium mb-2">
              {offer.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">{offer.title}</h1>
            <p className="text-gray-200 text-lg">{offer.destination}</p>
          </div>
        </div>

        {/* Advertisement Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">Special Promotion!</h3>
              <p className="text-white">Get 10% off when you book this trip today. Use code TRAVEL10</p>
            </div>
            <button className="bg-white text-orange-500 hover:bg-gray-100 font-bold py-2 px-6 rounded-full">
              Learn More
            </button>
          </div>
        </div>

        {/* Offer Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Trip Overview</h2>
                <p className="text-gray-700 mb-4">{offer.description}</p>
                
                {/* Full-size image display */}
                {offer.images && offer.images.length > 0 && (
                  <div className="mt-4 mb-6">
                    <img
                      src={offer.images[0]}
                      alt={offer.title}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Highlights */}
              {offer.highlights && offer.highlights.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Highlights</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {offer.highlights.map((highlight, index) => (
                      <li key={index} className="text-gray-700">{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary */}
              {offer.itinerary && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Itinerary</h2>
                  <p className="text-gray-700 whitespace-pre-line">{offer.itinerary}</p>
                </div>
              )}

              {/* Inclusions and Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {offer.inclusions && offer.inclusions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Inclusions</h2>
                    <ul className="list-disc pl-5 space-y-1">
                      {offer.inclusions.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {offer.exclusions && offer.exclusions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Exclusions</h2>
                    <ul className="list-disc pl-5 space-y-1">
                      {offer.exclusions.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Info */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Price</h3>
                  <p className="text-3xl font-bold text-teal-600">${offer.price}</p>
                  <p className="text-gray-600 text-sm">per person</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Travel Dates</h3>
                  <p className="text-gray-700">{formatDate(offer.travel_dates?.start_date)} to {formatDate(offer.travel_dates?.end_date)}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Provided By</h3>
                  <p className="text-gray-700">{offer.company_name}</p>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Information</h3>
                  
                  {offer.contact_info?.phone && (
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <a href={`tel:${offer.contact_info.phone}`} className="text-gray-700 hover:text-teal-600">{offer.contact_info.phone}</a>
                    </div>
                  )}
                  
                  {offer.contact_info?.email && (
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <a href={`mailto:${offer.contact_info.email}`} className="text-gray-700 hover:text-teal-600">{offer.contact_info.email}</a>
                    </div>
                  )}
                  
                  {offer.contact_info?.address && (
                    <div className="flex items-start mb-2">
                      <svg className="w-5 h-5 text-teal-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-gray-700">{offer.contact_info.address}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <a
                    href={offer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-md text-center transition-colors duration-300"
                  >
                    Book Now
                  </a>
                </div>

                {offer.contact_info?.phone && (
                  <div>
                    <a
                      href={`tel:${offer.contact_info.phone}`}
                      className="block w-full bg-white border-2 border-teal-500 text-teal-500 font-bold py-3 px-4 rounded-md text-center hover:bg-teal-50 transition-colors duration-300"
                    >
                      Call Now
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Advertisement Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Need Travel Insurance?
            </h3>
            <p className="text-gray-600">
              Protect your journey with our comprehensive travel insurance. 
              Coverage includes trip cancellation, medical emergencies, and more.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1591086109278-374183e20696?q=80&w=1867&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Travel Insurance"
            className="w-full md:w-72 h-36 object-cover rounded-lg"
          />
        </div>
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
  const [heroAds, setHeroAds] = useState([]);
  const [adLoading, setAdLoading] = useState(true);

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
    
    const fetchHeroAds = async () => {
      setAdLoading(true);
      try {
        const response = await axios.get(`${API}/advertisements?location=hero&active_only=true`);
        setHeroAds(response.data);
        setAdLoading(false);
      } catch (error) {
        console.error("Error fetching hero ads:", error);
        setAdLoading(false);
      }
    };

    fetchOffers();
    fetchHeroAds();
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
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 hero-text-animation">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl hero-text-animation">
            Explore the best travel offers from top Maldivian travel companies,
            all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advertisement Banner */}
        {!adLoading && heroAds.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg mb-8 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                {heroAds[0].image_url && (
                  <img 
                    src={heroAds[0].image_url} 
                    alt={heroAds[0].title}
                    className="h-16 w-24 object-cover rounded-md mr-4 hidden md:block"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{heroAds[0].title}</h3>
                  <p className="text-white">{heroAds[0].description}</p>
                </div>
              </div>
              <a 
                href={heroAds[0].link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-orange-500 hover:bg-gray-100 font-bold py-2 px-6 rounded-full"
              >
                Learn More
              </a>
            </div>
          </div>
        )}

        {/* Fallback Promotion Banner (if no ads available) */}
        {(adLoading || heroAds.length === 0) && (
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
        )}

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
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

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
      navigate("/admin/dashboard");
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("offers");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAdManager, setShowAdManager] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/offers`);
        setOffers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/admin");
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
          {/* Tabs */}
          <div className="mb-6 bg-white shadow rounded-lg">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "offers"
                    ? "border-b-2 border-teal-500 text-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("offers")}
              >
                Offers
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "categories"
                    ? "border-b-2 border-teal-500 text-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Categories
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "ads"
                    ? "border-b-2 border-teal-500 text-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("ads")}
              >
                Ad Spaces
              </button>
            </div>
          </div>

          {activeTab === "offers" ? (
            showAddForm ? (
              <AddOfferForm 
                onClose={() => setShowAddForm(false)} 
                onSuccess={(newOffer) => {
                  setOffers([newOffer, ...offers]);
                  setShowAddForm(false);
                }}
              />
            ) : showEditForm ? (
              <EditOfferForm
                offerId={showEditForm}
                onClose={() => setShowEditForm(null)}
                onSuccess={(updatedOffer) => {
                  setOffers(offers.map(offer => 
                    offer.id === updatedOffer.id ? updatedOffer : offer
                  ));
                  setShowEditForm(null);
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
                                  onClick={() => setShowEditForm(offer.id)}
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
            )
          ) : activeTab === "categories" ? (
            <CategoryManagement />
          ) : (
            <AdManagement />
          )}
        </div>
      </div>
    </div>
  );
};

// Ad Management Component
const AdManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Predefined ad placement locations
  const adLocations = [
    { value: "hero", label: "Hero Banner (Home)" },
    { value: "sidebar", label: "Sidebar (All Pages)" },
    { value: "offer_detail", label: "Offer Detail Page" },
    { value: "footer", label: "Footer (All Pages)" }
  ];

  useEffect(() => {
    const fetchAdvertisements = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        // Get all ads (including inactive ones) for admin view
        const response = await axios.get(`${API}/advertisements?active_only=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdvertisements(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching advertisements:", error);
        setError("Failed to load advertisements");
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleAddAdvertisement = async (adData) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(`${API}/admin/advertisements`, adData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setAdvertisements([...advertisements, response.data]);
      setShowAddForm(false);
      return true;
    } catch (error) {
      console.error("Error adding advertisement:", error);
      return false;
    }
  };

  const handleUpdateAdvertisement = async (adId, adData) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(`${API}/admin/advertisements/${adId}`, adData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setAdvertisements(advertisements.map(ad => 
        ad.id === adId ? response.data : ad
      ));
      
      setShowEditForm(null);
      return true;
    } catch (error) {
      console.error("Error updating advertisement:", error);
      return false;
    }
  };

  const handleDeleteAdvertisement = async (adId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`${API}/admin/advertisements/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdvertisements(advertisements.filter(ad => ad.id !== adId));
      setShowDeleteConfirm(null);
      return true;
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      return false;
    }
  };

  const toggleAdStatus = async (ad) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(`${API}/admin/advertisements/${ad.id}`, 
        { is_active: !ad.is_active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      setAdvertisements(advertisements.map(item => 
        item.id === ad.id ? response.data : item
      ));
      
      return true;
    } catch (error) {
      console.error("Error toggling ad status:", error);
      return false;
    }
  };

  const AdForm = ({ initialData, onSubmit, onCancel, isEdit }) => {
    const [formData, setFormData] = useState({
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      link_url: initialData?.link_url || "",
      location: initialData?.placement?.location || "hero",
      location_description: initialData?.placement?.description || "",
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      if (!formData.title.trim() || !formData.image_url.trim() || !formData.link_url.trim()) {
        setError("Title, image URL, and link URL are required");
        setLoading(false);
        return;
      }

      // Format data for API
      const adData = {
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url,
        link_url: formData.link_url,
        placement: {
          location: formData.location,
          description: formData.location_description || undefined
        },
        is_active: formData.is_active
      };

      const success = await onSubmit(adData);
      if (!success) {
        setError("Failed to save advertisement.");
      }
      setLoading(false);
    };

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? "Edit Advertisement" : "Add New Advertisement"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advertisement Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the URL of the advertisement image</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <input
              type="url"
              name="link_url"
              value={formData.link_url}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Where should users be directed when they click the ad?</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Placement
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            >
              {adLocations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placement Description
            </label>
            <input
              type="text"
              name="location_description"
              value={formData.location_description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Top position, Right sidebar"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active (advertisement will be displayed on the site)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Add Advertisement"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const getLocationLabel = (locationValue) => {
    const location = adLocations.find(loc => loc.value === locationValue);
    return location ? location.label : locationValue;
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Advertisement Management</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            Add New Advertisement
          </button>
        </div>

        {showAddForm && (
          <AdForm
            onSubmit={handleAddAdvertisement}
            onCancel={() => setShowAddForm(false)}
            isEdit={false}
          />
        )}

        {showEditForm && (
          <AdForm
            initialData={advertisements.find(ad => ad.id === showEditForm)}
            onSubmit={(data) => handleUpdateAdvertisement(showEditForm, data)}
            onCancel={() => setShowEditForm(null)}
            isEdit={true}
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : advertisements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No advertisements found. Add your first advertisement!</p>
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
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advertisements.map((ad) => (
                  <tr key={ad.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ad.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="h-12 w-24 object-cover rounded" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLocationLabel(ad.placement.location)}
                      {ad.placement.description && (
                        <p className="text-xs text-gray-400">{ad.placement.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ad.is_active 
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ad.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowEditForm(ad.id)}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === ad.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteAdvertisement(ad.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(ad.id)}
                            className="text-red-600 hover:text-red-900"
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

      {/* Preview Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ad Placement Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adLocations.map((location) => {
            const adsForLocation = advertisements.filter(
              ad => ad.is_active && ad.placement.location === location.value
            );
            
            return (
              <div key={location.value} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{location.label}</h4>
                {adsForLocation.length === 0 ? (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                    No active ads for this location
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adsForLocation.map((ad) => (
                      <div key={ad.id} className="border rounded-lg overflow-hidden">
                        <img 
                          src={ad.image_url} 
                          alt={ad.title} 
                          className="w-full h-32 object-cover" 
                        />
                        <div className="p-2">
                          <p className="font-medium text-sm">{ad.title}</p>
                          {ad.description && (
                            <p className="text-xs text-gray-500">{ad.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Category Management Component
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${API}/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async (categoryData) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(`${API}/admin/categories`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setCategories([...categories, response.data]);
      setShowAddForm(false);
      return true;
    } catch (error) {
      console.error("Error adding category:", error);
      return false;
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(`${API}/admin/categories/${categoryId}`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setCategories(categories.map(cat => 
        cat.id === categoryId ? response.data : cat
      ));
      
      setShowEditForm(null);
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories(categories.filter(cat => cat.id !== categoryId));
      setShowDeleteConfirm(null);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error.response?.status === 400) {
        alert("Cannot delete category that is being used by travel offers");
      }
      return false;
    }
  };

  const CategoryForm = ({ initialData, onSubmit, onCancel, isEdit }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || "",
      description: initialData?.description || ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      if (!formData.name.trim()) {
        setError("Category name is required");
        setLoading(false);
        return;
      }

      const success = await onSubmit(formData);
      if (!success) {
        setError("Failed to save category. It might already exist.");
      }
      setLoading(false);
    };

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            Add New Category
          </button>
        </div>

        {showAddForm && (
          <CategoryForm
            onSubmit={handleAddCategory}
            onCancel={() => setShowAddForm(false)}
            isEdit={false}
          />
        )}

        {showEditForm && (
          <CategoryForm
            initialData={categories.find(cat => cat.id === showEditForm)}
            onSubmit={(data) => handleUpdateCategory(showEditForm, data)}
            onCancel={() => setShowEditForm(null)}
            isEdit={true}
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found. Add your first category!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowEditForm(category.id)}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          Edit
                        </button>
                        {showDeleteConfirm === category.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(category.id)}
                            className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

// Add Offer Form Component
const EditOfferForm = ({ offerId, onClose, onSuccess }) => {
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
    image_url: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    itinerary: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch offer data
    const fetchOfferData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API}/offers/${offerId}`);
        const offer = response.data;
        
        // Format the data for the form
        setFormData({
          title: offer.title || "",
          destination: offer.destination || "",
          description: offer.description || "",
          price: offer.price?.toString() || "",
          category: offer.category || "",
          company_name: offer.company_name || "",
          company_website: offer.company_website || "",
          start_date: offer.travel_dates?.start_date ? offer.travel_dates.start_date.split('T')[0] : "",
          end_date: offer.travel_dates?.end_date ? offer.travel_dates.end_date.split('T')[0] : "",
          image_url: offer.images && offer.images.length > 0 ? offer.images[0] : "",
          contact_phone: offer.contact_info?.phone || "",
          contact_email: offer.contact_info?.email || "",
          contact_address: offer.contact_info?.address || "",
          highlights: offer.highlights ? offer.highlights.join('\n') : "",
          inclusions: offer.inclusions ? offer.inclusions.join('\n') : "",
          exclusions: offer.exclusions ? offer.exclusions.join('\n') : "",
          itinerary: offer.itinerary || ""
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offer data:", error);
        setError("Failed to load offer data");
        setLoading(false);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        // First try to get admin categories
        const token = localStorage.getItem("accessToken");
        let response;
        
        if (token) {
          try {
            response = await axios.get(`${API}/admin/categories`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // If admin categories exist, use their names
            if (response.data && response.data.length > 0) {
              setCategories(response.data.map(cat => cat.name));
              return;
            }
          } catch (err) {
            console.log("Falling back to public categories endpoint");
          }
        }
        
        // Fallback to public categories endpoint
        response = await axios.get(`${API}/categories`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchOfferData();
  }, [offerId]);

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
      
      // Convert comma-separated strings to arrays
      const highlights = formData.highlights ? formData.highlights.split('\n').filter(item => item.trim()) : [];
      const inclusions = formData.inclusions ? formData.inclusions.split('\n').filter(item => item.trim()) : [];
      const exclusions = formData.exclusions ? formData.exclusions.split('\n').filter(item => item.trim()) : [];
      
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
        images: formData.image_url ? [formData.image_url] : [],
        contact_info: {
          phone: formData.contact_phone || undefined,
          email: formData.contact_email || undefined,
          address: formData.contact_address || undefined
        },
        highlights,
        inclusions,
        exclusions,
        itinerary: formData.itinerary || undefined
      };

      const response = await axios.put(`${API}/admin/offers/${offerId}`, offerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      onSuccess(response.data);
    } catch (error) {
      console.error("Error updating offer:", error);
      setError("Failed to update offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Edit Travel Offer</h2>
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

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="edit-offer-form">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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

        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="+1 123 456 7890"
              data-testid="phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="contact@example.com"
              data-testid="email-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="contact_address"
            value={formData.contact_address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="123 Main St, City, Country"
            data-testid="address-input"
          />
        </div>

        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Additional Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Highlights (one per line)
          </label>
          <textarea
            name="highlights"
            value={formData.highlights}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Visit the Eiffel Tower&#10;Explore the Louvre Museum&#10;Cruise on the Seine River"
            data-testid="highlights-input"
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">Enter each highlight on a new line</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inclusions (one per line)
            </label>
            <textarea
              name="inclusions"
              value={formData.inclusions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Hotel accommodations&#10;Breakfast&#10;Airport transfers"
              data-testid="inclusions-input"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Enter each item on a new line</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exclusions (one per line)
            </label>
            <textarea
              name="exclusions"
              value={formData.exclusions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Flights&#10;Travel insurance&#10;Personal expenses"
              data-testid="exclusions-input"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Enter each item on a new line</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Itinerary
          </label>
          <textarea
            name="itinerary"
            value={formData.itinerary}
            onChange={handleChange}
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Day 1: Arrival and welcome dinner&#10;Day 2: City tour&#10;Day 3: Free day for exploration"
            data-testid="itinerary-input"
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
            {loading ? "Saving..." : "Update Offer"}
          </button>
        </div>
      </form>
    </div>
  );
};

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
    image_url: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    itinerary: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        // First try to get admin categories
        const token = localStorage.getItem("accessToken");
        let response;
        
        if (token) {
          try {
            response = await axios.get(`${API}/admin/categories`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // If admin categories exist, use their names
            if (response.data && response.data.length > 0) {
              setCategories(response.data.map(cat => cat.name));
              return;
            }
          } catch (err) {
            console.log("Falling back to public categories endpoint");
          }
        }
        
        // Fallback to public categories endpoint
        response = await axios.get(`${API}/categories`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
      
      // Convert comma-separated strings to arrays
      const highlights = formData.highlights ? formData.highlights.split('\n').filter(item => item.trim()) : [];
      const inclusions = formData.inclusions ? formData.inclusions.split('\n').filter(item => item.trim()) : [];
      const exclusions = formData.exclusions ? formData.exclusions.split('\n').filter(item => item.trim()) : [];
      
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
        images: formData.image_url ? [formData.image_url] : [],
        contact_info: {
          phone: formData.contact_phone || undefined,
          email: formData.contact_email || undefined,
          address: formData.contact_address || undefined
        },
        highlights,
        inclusions,
        exclusions,
        itinerary: formData.itinerary || undefined
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

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="add-offer-form">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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

        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="+1 123 456 7890"
              data-testid="phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="contact@example.com"
              data-testid="email-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="contact_address"
            value={formData.contact_address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="123 Main St, City, Country"
            data-testid="address-input"
          />
        </div>

        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Additional Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Highlights (one per line)
          </label>
          <textarea
            name="highlights"
            value={formData.highlights}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Visit the Eiffel Tower&#10;Explore the Louvre Museum&#10;Cruise on the Seine River"
            data-testid="highlights-input"
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">Enter each highlight on a new line</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inclusions (one per line)
            </label>
            <textarea
              name="inclusions"
              value={formData.inclusions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Hotel accommodations&#10;Breakfast&#10;Airport transfers"
              data-testid="inclusions-input"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Enter each item on a new line</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exclusions (one per line)
            </label>
            <textarea
              name="exclusions"
              value={formData.exclusions}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Flights&#10;Travel insurance&#10;Personal expenses"
              data-testid="exclusions-input"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Enter each item on a new line</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Itinerary
          </label>
          <textarea
            name="itinerary"
            value={formData.itinerary}
            onChange={handleChange}
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Day 1: Arrival and welcome dinner&#10;Day 2: City tour&#10;Day 3: Free day for exploration"
            data-testid="itinerary-input"
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

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <HashRouter>
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
          <Route
            path="/offers/:id"
            element={
              <>
                <Navbar />
                <OfferDetail />
              </>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/offers/edit/:id" element={<AdminDashboard />} />
          <Route path="*" element={
            <>
              <Navbar />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
                <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                <Link to="/" className="mt-4 inline-block text-teal-600 hover:text-teal-800">
                  &larr; Back to Home
                </Link>
              </div>
            </>
          } />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
