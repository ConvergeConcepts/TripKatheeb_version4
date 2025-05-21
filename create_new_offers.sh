#!/bin/bash

# Create default admin user
curl -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/create-default-admin"

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

# Create sample offers
echo "Creating sample travel offers..."

# Sample 1: Italy Mountain Getaway
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Italian Alps Adventure",
    "destination": "Dolomites, Italy",
    "description": "Experience the breathtaking beauty of the Italian Dolomites with this all-inclusive mountain getaway. Enjoy hiking, local cuisine, and spectacular views in one of Europe'\''s most stunning mountain ranges.",
    "price": 1899,
    "travel_dates": {
      "start_date": "2025-06-15",
      "end_date": "2025-06-25"
    },
    "company_name": "Alpine Explorers",
    "company_website": "https://example.com/alpine-explorers",
    "category": "Adventure",
    "images": ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"]
  }'

echo "Created Italian Alps Adventure offer"

# Sample 2: Hawaiian Beach Vacation
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hawaiian Beach Paradise",
    "destination": "Oahu, Hawaii",
    "description": "Escape to the pristine beaches of Hawaii with this luxury vacation package. Includes beachfront accommodation, snorkeling tours, and authentic luau experience.",
    "price": 2499,
    "travel_dates": {
      "start_date": "2025-07-10",
      "end_date": "2025-07-20"
    },
    "company_name": "Tropical Escapes",
    "company_website": "https://example.com/tropical-escapes",
    "category": "Beach",
    "images": ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"]
  }'

echo "Created Hawaiian Beach Paradise offer"

# Sample 3: Portugal Cultural Tour
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Portugal Heritage Journey",
    "destination": "Lisbon & Porto, Portugal",
    "description": "Immerse yourself in the rich history and culture of Portugal with this guided tour of Lisbon and Porto. Visit historic monuments, taste local wines, and experience authentic Fado music.",
    "price": 1750,
    "travel_dates": {
      "start_date": "2025-09-05",
      "end_date": "2025-09-15"
    },
    "company_name": "Heritage Voyages",
    "company_website": "https://example.com/heritage-voyages",
    "category": "Cultural",
    "images": ["https://images.unsplash.com/photo-1740446820152-2581317da23a"]
  }'

echo "Created Portugal Heritage Journey offer"

# Sample 4: Singapore City Break
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Singapore Urban Escape",
    "destination": "Singapore",
    "description": "Discover the vibrant city-state of Singapore with this luxury urban getaway. Stay in premium accommodation, explore world-class attractions, and indulge in the diverse culinary scene.",
    "price": 2150,
    "travel_dates": {
      "start_date": "2025-08-12",
      "end_date": "2025-08-19"
    },
    "company_name": "City Wanderers",
    "company_website": "https://example.com/city-wanderers",
    "category": "City Break",
    "images": ["https://images.unsplash.com/photo-1735817738436-a8689ed427cb"]
  }'

echo "Created Singapore Urban Escape offer"

# Sample 5: American Southwest Road Trip
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "American Southwest Road Trip",
    "destination": "Arizona & Utah, USA",
    "description": "Hit the open road with this epic journey through the stunning landscapes of Arizona and Utah. Visit Grand Canyon, Monument Valley, and Zion National Park with comfortable accommodation throughout.",
    "price": 2350,
    "travel_dates": {
      "start_date": "2025-05-20",
      "end_date": "2025-06-02"
    },
    "company_name": "Desert Trekkers",
    "company_website": "https://example.com/desert-trekkers",
    "category": "Road Trip",
    "images": ["https://images.unsplash.com/photo-1494783367193-149034c05e8f"]
  }'

echo "Created American Southwest Road Trip offer"

# Sample 6: Family-friendly safari
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Family Safari Adventure",
    "destination": "Kenya",
    "description": "Create unforgettable memories with this family-friendly safari through Kenya'\''s most iconic wildlife reserves. See the Big Five, visit a Maasai village, and stay in comfortable family lodges.",
    "price": 3200,
    "travel_dates": {
      "start_date": "2025-07-05",
      "end_date": "2025-07-15"
    },
    "company_name": "Safari Expeditions",
    "company_website": "https://example.com/safari-expeditions",
    "category": "Family",
    "images": ["https://images.unsplash.com/photo-1523805009345-7448845a9e53"]
  }'

echo "Created Family Safari Adventure offer"

# Sample 7: Honeymoon package
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/offers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Romantic Bali Honeymoon",
    "destination": "Bali, Indonesia",
    "description": "Begin your marriage in paradise with this luxurious honeymoon package in Bali. Includes private villa with pool, couples spa treatments, and romantic sunset dinner cruise.",
    "price": 2750,
    "travel_dates": {
      "start_date": "2025-09-10",
      "end_date": "2025-09-20"
    },
    "company_name": "Honeymoon Havens",
    "company_website": "https://example.com/honeymoon-havens",
    "category": "Honeymoon",
    "images": ["https://images.unsplash.com/photo-1537953773345-d172ccf13cf1"]
  }'

echo "Created Romantic Bali Honeymoon offer"

echo "Sample travel offers created successfully!"
