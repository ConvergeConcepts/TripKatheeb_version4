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

# Create a sample advertisement
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/advertisements" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Special Travel Insurance Offer",
    "description": "Get 15% off on travel insurance when booking through our partners",
    "image_url": "https://images.unsplash.com/photo-1591086109278-374183e20696?q=80&w=1867&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "link_url": "https://example.com/insurance-offer",
    "placement": {
      "location": "offer_detail",
      "description": "Below trip details"
    },
    "is_active": true
  }'

echo "Created test advertisement"

# Create another advertisement for a different placement
curl -s -X POST "https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api/admin/advertisements" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Flight Deals",
    "description": "Book your summer flights early and save up to 30%",
    "image_url": "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "link_url": "https://example.com/flight-deals",
    "placement": {
      "location": "hero",
      "description": "Top banner"
    },
    "is_active": true
  }'

echo "Created second test advertisement"

echo "Test advertisements created successfully!"
