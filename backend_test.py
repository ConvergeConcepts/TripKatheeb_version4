import requests
import sys
import uuid
from datetime import datetime

class MaldivesTravelAPITester:
    def __init__(self, base_url="https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            "offers": [],
            "ads": []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self, username="admin", password="password"):
        """Test admin login and get token"""
        # Using form data for login as required by OAuth2PasswordRequestForm
        url = f"{self.base_url}/admin/login"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            "username": username,
            "password": password
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Login...")
        
        try:
            response = requests.post(url, data=data, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_data = response.json()
                return success, response_data
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"✅ Successfully logged in as admin")
            return True
        return False

    def test_get_offers(self, params=None):
        """Test getting all offers"""
        success, response = self.run_test(
            "Get All Offers",
            "GET",
            "offers",
            200,
            params=params
        )
        if success:
            print(f"✅ Retrieved {len(response)} offers")
        return success, response

    def test_get_offer(self, offer_id):
        """Test getting a specific offer"""
        success, response = self.run_test(
            f"Get Offer {offer_id}",
            "GET",
            f"offers/{offer_id}",
            200
        )
        if success:
            print(f"✅ Retrieved offer: {response.get('title', 'Unknown')}")
        return success, response

    def test_create_offer(self, offer_data):
        """Test creating a new offer"""
        success, response = self.run_test(
            "Create Offer",
            "POST",
            "admin/offers",
            201,
            data=offer_data
        )
        if success and 'id' in response:
            self.created_resources["offers"].append(response['id'])
            print(f"✅ Created offer with ID: {response['id']}")
        return success, response

    def test_update_offer(self, offer_id, updated_data):
        """Test updating an offer"""
        success, response = self.run_test(
            f"Update Offer {offer_id}",
            "PUT",
            f"admin/offers/{offer_id}",
            200,
            data=updated_data
        )
        if success:
            print(f"✅ Updated offer: {response.get('title', 'Unknown')}")
        return success, response

    def test_delete_offer(self, offer_id):
        """Test deleting an offer"""
        success, _ = self.run_test(
            f"Delete Offer {offer_id}",
            "DELETE",
            f"admin/offers/{offer_id}",
            200
        )
        if success:
            if offer_id in self.created_resources["offers"]:
                self.created_resources["offers"].remove(offer_id)
            print(f"✅ Deleted offer with ID: {offer_id}")
        return success

    def test_get_advertisements(self, params=None):
        """Test getting all advertisements"""
        success, response = self.run_test(
            "Get All Advertisements",
            "GET",
            "advertisements",
            200,
            params=params
        )
        if success:
            print(f"✅ Retrieved {len(response)} advertisements")
        return success, response

    def test_get_advertisement(self, ad_id):
        """Test getting a specific advertisement"""
        success, response = self.run_test(
            f"Get Advertisement {ad_id}",
            "GET",
            f"advertisements/{ad_id}",
            200
        )
        if success:
            print(f"✅ Retrieved advertisement: {response.get('title', 'Unknown')}")
        return success, response

    def test_create_advertisement(self, ad_data):
        """Test creating a new advertisement"""
        success, response = self.run_test(
            "Create Advertisement",
            "POST",
            "admin/advertisements",
            201,
            data=ad_data
        )
        if success and 'id' in response:
            self.created_resources["ads"].append(response['id'])
            print(f"✅ Created advertisement with ID: {response['id']}")
        return success, response

    def test_update_advertisement(self, ad_id, updated_data):
        """Test updating an advertisement"""
        success, response = self.run_test(
            f"Update Advertisement {ad_id}",
            "PUT",
            f"admin/advertisements/{ad_id}",
            200,
            data=updated_data
        )
        if success:
            print(f"✅ Updated advertisement: {response.get('title', 'Unknown')}")
        return success, response

    def test_delete_advertisement(self, ad_id):
        """Test deleting an advertisement"""
        success, _ = self.run_test(
            f"Delete Advertisement {ad_id}",
            "DELETE",
            f"admin/advertisements/{ad_id}",
            200
        )
        if success:
            if ad_id in self.created_resources["ads"]:
                self.created_resources["ads"].remove(ad_id)
            print(f"✅ Deleted advertisement with ID: {ad_id}")
        return success

    def cleanup(self):
        """Clean up any resources created during testing"""
        print("\n🧹 Cleaning up created resources...")
        
        for offer_id in self.created_resources["offers"]:
            self.test_delete_offer(offer_id)
            
        for ad_id in self.created_resources["ads"]:
            self.test_delete_advertisement(ad_id)

def main():
    # Setup
    tester = MaldivesTravelAPITester()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    print("\n🔍 TESTING MALDIVES TRAVEL OFFERS AGGREGATOR API 🔍")
    print("=" * 60)
    
    # Test public endpoints first (no auth required)
    print("\n📌 TESTING PUBLIC ENDPOINTS")
    print("-" * 40)
    
    # Get all offers
    offers_success, offers = tester.test_get_offers()
    if not offers_success:
        print("❌ Failed to get offers, some tests will be skipped")
    
    # Get a specific offer if available
    offer_id_to_test = None
    if offers_success and offers:
        offer_id_to_test = offers[0]['id']
        tester.test_get_offer(offer_id_to_test)
    
    # Get all advertisements
    ads_success, ads = tester.test_get_advertisements()
    if not ads_success:
        print("❌ Failed to get advertisements, some tests will be skipped")
    
    # Get a specific advertisement if available
    ad_id_to_test = None
    if ads_success and ads:
        ad_id_to_test = ads[0]['id']
        tester.test_get_advertisement(ad_id_to_test)
    
    # Test admin endpoints (auth required)
    print("\n📌 TESTING ADMIN ENDPOINTS")
    print("-" * 40)
    
    # Login as admin
    if not tester.test_admin_login():
        print("❌ Admin login failed, admin tests will be skipped")
        print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
        return 1
    
    # Test offer management
    print("\n📌 TESTING OFFER MANAGEMENT")
    print("-" * 40)
    
    # Create a test offer
    test_offer = {
        "title": f"Test Offer {timestamp}",
        "description": "This is a test offer created by the API tester",
        "price": 1999.99,
        "location": "South Malé Atoll",
        "image_url": "https://example.com/test-image.jpg",
        "category": "Luxury",
        "company_name": "Test Travel Agency",
        "duration": "5 days",
        "highlights": ["Beautiful beaches", "Amazing sunsets", "Luxury accommodation"],
        "inclusions": ["Airport transfers", "Daily breakfast", "Guided tours"],
        "exclusions": ["International flights", "Travel insurance", "Personal expenses"]
    }
    
    create_offer_success, created_offer = tester.test_create_offer(test_offer)
    
    if create_offer_success:
        # Update the created offer
        updated_offer = created_offer.copy()
        updated_offer["title"] = f"Updated Test Offer {timestamp}"
        updated_offer["price"] = 2499.99
        updated_offer["highlights"] = ["Updated beaches", "Updated sunsets", "Updated accommodation"]
        
        update_success, _ = tester.test_update_offer(created_offer["id"], updated_offer)
        
        # Get the updated offer to verify changes
        if update_success:
            tester.test_get_offer(created_offer["id"])
    
    # Test advertisement management
    print("\n📌 TESTING ADVERTISEMENT MANAGEMENT")
    print("-" * 40)
    
    # Create test advertisements for different placements
    test_ad_hero = {
        "title": f"Hero Banner Ad {timestamp}",
        "description": "This is a test hero banner advertisement",
        "image_url": "https://example.com/hero-ad.jpg",
        "link_url": "https://example.com/hero-promo",
        "placement": {
            "location": "hero_banner",
            "priority": 1
        },
        "is_active": True
    }
    
    test_ad_offer_detail = {
        "title": f"Offer Detail Ad {timestamp}",
        "description": "This is a test offer detail advertisement",
        "image_url": "https://example.com/offer-detail-ad.jpg",
        "link_url": "https://example.com/offer-promo",
        "placement": {
            "location": "offer_detail",
            "priority": 1
        },
        "is_active": True
    }
    
    # Create hero banner ad
    hero_ad_success, hero_ad = tester.test_create_advertisement(test_ad_hero)
    
    if hero_ad_success:
        # Update the hero banner ad
        updated_hero_ad = hero_ad.copy()
        updated_hero_ad["title"] = f"Updated Hero Banner Ad {timestamp}"
        updated_hero_ad["is_active"] = False
        
        update_hero_success, _ = tester.test_update_advertisement(hero_ad["id"], updated_hero_ad)
        
        # Get the updated ad to verify changes
        if update_hero_success:
            tester.test_get_advertisement(hero_ad["id"])
    
    # Create offer detail ad
    offer_ad_success, offer_ad = tester.test_create_advertisement(test_ad_offer_detail)
    
    if offer_ad_success:
        # Update the offer detail ad
        updated_offer_ad = offer_ad.copy()
        updated_offer_ad["title"] = f"Updated Offer Detail Ad {timestamp}"
        updated_offer_ad["placement"]["priority"] = 2
        
        update_offer_ad_success, _ = tester.test_update_advertisement(offer_ad["id"], updated_offer_ad)
        
        # Get the updated ad to verify changes
        if update_offer_ad_success:
            tester.test_get_advertisement(offer_ad["id"])
    
    # Clean up created resources
    tester.cleanup()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
