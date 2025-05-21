import requests
import sys
import json
from datetime import datetime, timedelta

class MaldivesTravelAPITester:
    def __init__(self, base_url="https://4acbcb40-04e2-4184-b7c4-6f18e1c17d05.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_offer_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    if isinstance(data, dict):
                        headers['Content-Type'] = 'application/json'
                        response = requests.post(url, json=data, headers=headers)
                    else:
                        response = requests.post(url, data=data, headers=headers)
            elif method == 'PUT':
                headers['Content-Type'] = 'application/json'
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test the API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "/api/",
            200
        )
        return success

    def test_get_offers(self):
        """Test getting all offers"""
        success, response = self.run_test(
            "Get All Offers",
            "GET",
            "/api/offers",
            200
        )
        if success:
            print(f"Found {len(response)} offers")
        return success, response

    def test_get_categories(self):
        """Test getting all categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "/api/categories",
            200
        )
        if success:
            print(f"Categories: {response['categories']}")
        return success

    def test_filter_offers(self):
        """Test filtering offers"""
        success, response = self.run_test(
            "Filter Offers by Destination",
            "GET",
            "/api/offers?destination=Maldives",
            200
        )
        if success:
            print(f"Found {len(response)} offers for Maldives")
        
        success2, response2 = self.run_test(
            "Filter Offers by Price Range",
            "GET",
            "/api/offers?min_price=500&max_price=2000",
            200
        )
        if success2:
            print(f"Found {len(response2)} offers in price range $500-$2000")
        
        success3, response3 = self.run_test(
            "Sort Offers by Price (Ascending)",
            "GET",
            "/api/offers?sort_by=price&sort_order=asc",
            200
        )
        if success3 and len(response3) > 1:
            print(f"First offer price: ${response3[0]['price']}, Last offer price: ${response3[-1]['price']}")
            if response3[0]['price'] <= response3[-1]['price']:
                print("✅ Sorting works correctly")
            else:
                print("❌ Sorting may not be working correctly")
                
        return success and success2 and success3

    def test_create_default_admin(self):
        """Test creating the default admin user"""
        success, response = self.run_test(
            "Create Default Admin",
            "POST",
            "/api/admin/create-default-admin",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        # For OAuth2 form data, we need to use the correct format
        form_data = "username=admin&password=admin123"
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        
        url = f"{self.base_url}/api/admin/login"
        print(f"Attempting login to: {url}")
        
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Login...")
        
        try:
            response = requests.post(
                url, 
                data=form_data,
                headers=headers
            )
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_data = response.json()
                if 'access_token' in response_data:
                    self.token = response_data['access_token']
                    print(f"Successfully logged in as admin")
                    return True
                else:
                    print("❌ No access token in response")
                    return False
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"Successfully logged in as admin")
            return True
        return False

    def test_create_offer(self):
        """Test creating a new travel offer"""
        # Create a test offer
        start_date = datetime.now() + timedelta(days=30)
        end_date = start_date + timedelta(days=7)
        
        offer_data = {
            "title": "Test Luxury Resort Stay",
            "destination": "Maldives",
            "description": "A test offer for API testing purposes",
            "price": 1299.99,
            "travel_dates": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "company_name": "Test Travel Agency",
            "company_website": "https://example.com",
            "category": "Luxury",
            "images": ["https://example.com/image.jpg"]
        }
        
        success, response = self.run_test(
            "Create Travel Offer",
            "POST",
            "/api/admin/offers",
            200,  # The API returns 200 instead of 201
            data=offer_data
        )
        
        if success and 'id' in response:
            self.created_offer_id = response['id']
            print(f"Created offer with ID: {self.created_offer_id}")
            return True
        return False

    def test_get_offer_by_id(self):
        """Test getting a specific offer by ID"""
        if not self.created_offer_id:
            print("❌ No offer ID available to test")
            return False
            
        success, response = self.run_test(
            "Get Offer by ID",
            "GET",
            f"/api/offers/{self.created_offer_id}",
            200
        )
        
        if success:
            print(f"Retrieved offer: {response['title']}")
        return success

    def test_update_offer(self):
        """Test updating an offer"""
        if not self.created_offer_id:
            print("❌ No offer ID available to test")
            return False
            
        update_data = {
            "title": "Updated Test Offer",
            "price": 1499.99
        }
        
        success, response = self.run_test(
            "Update Travel Offer",
            "PUT",
            f"/api/admin/offers/{self.created_offer_id}",
            200,
            data=update_data
        )
        
        if success:
            print(f"Updated offer title: {response['title']}, price: {response['price']}")
            if response['title'] == update_data['title'] and response['price'] == update_data['price']:
                print("✅ Update successful")
                return True
            else:
                print("❌ Update may not have applied correctly")
                return False
        return False

    def test_delete_offer(self):
        """Test deleting an offer"""
        if not self.created_offer_id:
            print("❌ No offer ID available to test")
            return False
            
        success, response = self.run_test(
            "Delete Travel Offer",
            "DELETE",
            f"/api/admin/offers/{self.created_offer_id}",
            200
        )
        
        if success:
            # Verify the offer is actually deleted
            verify_success, _ = self.run_test(
                "Verify Deletion",
                "GET",
                f"/api/offers/{self.created_offer_id}",
                404  # Should return 404 Not Found
            )
            
            if verify_success:
                print("✅ Offer successfully deleted")
                return True
            else:
                print("❌ Offer may not have been deleted")
                return False
        return False

def main():
    print("🌴 Starting Maldives Travel Offers API Tests 🌴")
    print("==============================================")
    
    tester = MaldivesTravelAPITester()
    
    # Test public endpoints
    tester.test_api_root()
    success, offers = tester.test_get_offers()
    tester.test_get_categories()
    tester.test_filter_offers()
    
    # Test admin functionality
    tester.test_create_default_admin()
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping admin tests")
    else:
        # Test CRUD operations
        tester.test_create_offer()
        tester.test_get_offer_by_id()
        tester.test_update_offer()
        tester.test_delete_offer()
    
    # Print results
    print("\n==============================================")
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("==============================================")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())