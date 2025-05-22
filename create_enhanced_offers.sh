#!/bin/bash

# Login to get access token
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Successfully logged in and got access token"

# Create an enhanced offer with contact information and details
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paris & French Countryside Experience",
    "destination": "Paris, France",
    "description": "Immerse yourself in the romance of Paris and the beauty of the French countryside with this comprehensive 10-day tour. Experience the iconic sights of Paris and then escape to the rolling vineyards and charming villages of rural France for an authentic French experience.",
    "price": 2499,
    "travel_dates": {
      "start_date": "2025-07-15",
      "end_date": "2025-07-25"
    },
    "company_name": "European Explorers",
    "company_website": "https://example.com/european-explorers",
    "category": "Cultural",
    "images": ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
    "contact_info": {
      "phone": "+960 123-4567",
      "email": "bookings@europeanexplorers.com",
      "address": "123 Travel Avenue, Malé, Maldives"
    },
    "highlights": [
      "Guided tour of iconic Parisian landmarks including the Eiffel Tower and Louvre Museum",
      "Wine tasting experience in the Loire Valley",
      "Cooking class with a professional French chef",
      "Visit to the Palace of Versailles",
      "Exploration of charming villages in Provence"
    ],
    "inclusions": [
      "9 nights accommodation in 4-star hotels",
      "Daily breakfast and select dinners",
      "Professional English-speaking guide",
      "All transportation within France",
      "Skip-the-line tickets to major attractions",
      "Wine tasting and cooking class fees"
    ],
    "exclusions": [
      "International flights to/from France",
      "Travel insurance",
      "Personal expenses and gratuities",
      "Meals not specified in the itinerary"
    ],
    "itinerary": "Day 1: Arrival in Paris - Welcome dinner at a local bistro\nDay 2: Paris Highlights Tour - Eiffel Tower, Notre Dame, and Seine River Cruise\nDay 3: Louvre and Montmartre exploration\nDay 4: Day trip to Versailles Palace and Gardens\nDay 5: Travel to Loire Valley - Castle tour and wine tasting\nDay 6: Loire Valley exploration - Additional château visits\nDay 7: Travel to Burgundy region - Wine tour and tasting\nDay 8: Cooking class and local market visit\nDay 9: Travel to Provence - Lavender fields and village exploration\nDay 10: Return to Paris - Farewell dinner"
  }'

echo "Created enhanced Paris tour offer"

# Create another enhanced offer with different details
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Japanese Cherry Blossom Tour",
    "destination": "Tokyo, Kyoto, and Osaka, Japan",
    "description": "Experience the magical cherry blossom season in Japan with this specially timed tour. Visit the most beautiful sakura viewing spots in Tokyo, Kyoto, and Osaka while experiencing authentic Japanese culture, cuisine, and traditions.",
    "price": 3299,
    "travel_dates": {
      "start_date": "2025-03-25",
      "end_date": "2025-04-05"
    },
    "company_name": "Asian Wonders Travel",
    "company_website": "https://example.com/asian-wonders",
    "category": "Cultural",
    "images": ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
    "contact_info": {
      "phone": "+960 987-6543",
      "email": "info@asianwonders.com",
      "address": "456 Sakura Street, Malé, Maldives"
    },
    "highlights": [
      "Cherry blossom viewing in Ueno Park and Shinjuku Gyoen in Tokyo",
      "Traditional tea ceremony experience in Kyoto",
      "Visit to iconic Fushimi Inari Shrine with thousands of torii gates",
      "Day trip to Nara to see the friendly deer and historic temples",
      "Authentic Japanese cooking class",
      "Osaka food tour in Dotonbori district"
    ],
    "inclusions": [
      "11 nights accommodation in centrally located hotels",
      "Daily breakfast and select special dinners",
      "Japan Rail Pass for 7 days",
      "Airport transfers",
      "English-speaking guides for all tours",
      "All entrance fees to attractions listed in the itinerary",
      "Tea ceremony and cooking class fees"
    ],
    "exclusions": [
      "International flights to/from Japan",
      "Travel insurance",
      "Personal expenses",
      "Meals not specified in the itinerary"
    ],
    "itinerary": "Day 1: Arrival in Tokyo - Hotel check-in and orientation\nDay 2: Tokyo Exploration - Meiji Shrine, Harajuku, and Shibuya\nDay 3: Tokyo Cherry Blossom Viewing - Ueno Park and Sumida River\nDay 4: Tokyo to Hakone - Mount Fuji views and onsen experience\nDay 5: Hakone to Kyoto - Bullet train experience\nDay 6: Kyoto Temples and Gardens - Cherry blossom viewing\nDay 7: Kyoto Cultural Day - Tea ceremony and traditional arts\nDay 8: Day trip to Nara - Historic temples and friendly deer\nDay 9: Kyoto to Osaka - Osaka Castle and surroundings\nDay 10: Osaka Food Tour - Dotonbori and local specialties\nDay 11: Free day for shopping and personal exploration\nDay 12: Departure day"
  }'

echo "Created enhanced Japan cherry blossom tour offer"

echo "Enhanced offers created successfully!"
