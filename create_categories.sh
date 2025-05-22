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

# Create categories
echo "Creating categories..."

# Category 1: Adventure
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Adventure",
    "description": "Thrilling experiences and outdoor activities for the adrenaline junkie"
  }'

echo "Created Adventure category"

# Category 2: Beach
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beach",
    "description": "Relaxing getaways to the world'"'"'s most beautiful coastlines and islands"
  }'

echo "Created Beach category"

# Category 3: Cultural
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cultural",
    "description": "Immersive experiences in local traditions, history, and arts"
  }'

echo "Created Cultural category"

# Category 4: Family
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Family",
    "description": "Kid-friendly destinations and activities for the whole family"
  }'

echo "Created Family category"

# Category 5: Honeymoon
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Honeymoon",
    "description": "Romantic escapes for newlyweds and couples"
  }'

echo "Created Honeymoon category"

# Category 6: City Break
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Break",
    "description": "Short urban getaways to explore metropolitan destinations"
  }'

echo "Created City Break category"

# Category 7: Road Trip
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Road Trip",
    "description": "Self-drive adventures through scenic routes and landscapes"
  }'

echo "Created Road Trip category"

echo "Categories created successfully!"
