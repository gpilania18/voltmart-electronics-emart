#!/usr/bin/env python3
"""
VoltMart Backend API Test Suite - Phase 2
Tests all backend endpoints including new auth, user-protected, and admin features
"""
import requests
import os
import random
import string
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

print(f"Testing VoltMart API Phase 2 at: {API_BASE}\n")
print("=" * 80)

# Track test results
passed = 0
failed = 0
test_results = []

# Store tokens and IDs for later tests
user_token = None
admin_token = None
user_email = None
user_otp = None
address_id = None
order_id = None
forgot_email = None
forgot_otp = None

def random_email():
    """Generate a random email for testing"""
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{rand}@voltmart.com"

def test_endpoint(name, method, url, expected_status=200, json_body=None, headers=None, validate_fn=None):
    """Helper function to test an endpoint"""
    global passed, failed
    try:
        print(f"\n🧪 Testing: {name}")
        print(f"   {method} {url}")
        
        req_headers = headers or {}
        
        if method == 'GET':
            response = requests.get(url, headers=req_headers, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=json_body, headers=req_headers, timeout=30)
        elif method == 'PATCH':
            response = requests.patch(url, json=json_body, headers=req_headers, timeout=30)
        elif method == 'DELETE':
            response = requests.delete(url, headers=req_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   Status: {response.status_code}")
        
        # Check status code
        if response.status_code != expected_status:
            print(f"   ❌ FAILED: Expected status {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            failed += 1
            test_results.append(f"❌ {name}: Status {response.status_code} (expected {expected_status})")
            return False, None
        
        # Parse JSON response
        try:
            data = response.json()
        except Exception:
            if expected_status == 200:
                print(f"   ❌ FAILED: Could not parse JSON response")
                print(f"   Response: {response.text[:500]}")
                failed += 1
                test_results.append(f"❌ {name}: Invalid JSON response")
                return False, None
            data = None
        
        # Run custom validation if provided
        if validate_fn:
            validation_result = validate_fn(data)
            if validation_result is True:
                print(f"   ✅ PASSED")
                passed += 1
                test_results.append(f"✅ {name}")
                return True, data
            else:
                print(f"   ❌ FAILED: {validation_result}")
                print(f"   Response: {str(data)[:500]}")
                failed += 1
                test_results.append(f"❌ {name}: {validation_result}")
                return False, data
        else:
            print(f"   ✅ PASSED")
            passed += 1
            test_results.append(f"✅ {name}")
            return True, data
            
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        failed += 1
        test_results.append(f"❌ {name}: {str(e)}")
        return False, None

# ============================================================================
# PHASE 1 TESTS (Existing 23 tests - should still pass)
# ============================================================================
print("\n" + "=" * 80)
print("PHASE 1 TESTS - Verifying existing functionality")
print("=" * 80)

# TEST 1: Health Check
test_endpoint(
    "GET /api/health",
    "GET",
    f"{API_BASE}/health",
    validate_fn=lambda data: (
        True if (data.get('ok') is True and 
                data.get('service') == 'voltmart-api' and 
                'time' in data)
        else f"Invalid response structure: {data}"
    )
)

# TEST 2: Categories
test_endpoint(
    "GET /api/categories",
    "GET",
    f"{API_BASE}/categories",
    validate_fn=lambda data: (
        True if ('categories' in data and 
                isinstance(data['categories'], list) and 
                len(data['categories']) > 0)
        else "Invalid categories response"
    )
)

# TEST 3: Brands
test_endpoint(
    "GET /api/brands",
    "GET",
    f"{API_BASE}/brands",
    validate_fn=lambda data: (
        True if ('brands' in data and 
                isinstance(data['brands'], list) and 
                len(data['brands']) > 0)
        else "Invalid brands response"
    )
)

# TEST 4-17: Products API (basic, filters, sorting, pagination)
test_endpoint("GET /api/products", "GET", f"{API_BASE}/products",
    validate_fn=lambda d: True if d.get('total') == 48 else f"Expected 48 products, got {d.get('total')}")

test_endpoint("GET /api/products?category=arduino", "GET", f"{API_BASE}/products?category=arduino",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No arduino products")

test_endpoint("GET /api/products?brand=espressif", "GET", f"{API_BASE}/products?brand=espressif",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No espressif products")

test_endpoint("GET /api/products?deal=true", "GET", f"{API_BASE}/products?deal=true",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No deal products")

test_endpoint("GET /api/products?bestSeller=true", "GET", f"{API_BASE}/products?bestSeller=true",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No bestseller products")

test_endpoint("GET /api/products?trending=true", "GET", f"{API_BASE}/products?trending=true",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No trending products")

test_endpoint("GET /api/products?minPrice=1000&maxPrice=5000", "GET", f"{API_BASE}/products?minPrice=1000&maxPrice=5000",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No products in price range")

test_endpoint("GET /api/products?q=arduino", "GET", f"{API_BASE}/products?q=arduino",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No search results")

test_endpoint("GET /api/products?sort=price-low", "GET", f"{API_BASE}/products?sort=price-low",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No products")

test_endpoint("GET /api/products?sort=price-high", "GET", f"{API_BASE}/products?sort=price-high",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No products")

test_endpoint("GET /api/products?sort=rating", "GET", f"{API_BASE}/products?sort=rating",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No products")

test_endpoint("GET /api/products?sort=newest", "GET", f"{API_BASE}/products?sort=newest",
    validate_fn=lambda d: True if len(d.get('products', [])) > 0 else "No products")

test_endpoint("GET /api/products?page=1&limit=10", "GET", f"{API_BASE}/products?page=1&limit=10",
    validate_fn=lambda d: True if len(d.get('products', [])) == 10 else f"Expected 10 products, got {len(d.get('products', []))}")

test_endpoint("GET /api/products?page=2&limit=10", "GET", f"{API_BASE}/products?page=2&limit=10",
    validate_fn=lambda d: True if len(d.get('products', [])) == 10 else f"Expected 10 products, got {len(d.get('products', []))}")

# TEST 18-19: Product Detail
test_endpoint("GET /api/products/arduino-uno-r4-wifi-1", "GET", f"{API_BASE}/products/arduino-uno-r4-wifi-1",
    validate_fn=lambda d: True if 'product' in d and 'related' in d else "Missing product or related")

test_endpoint("GET /api/products/nonexistent-slug", "GET", f"{API_BASE}/products/nonexistent-slug",
    expected_status=404,
    validate_fn=lambda d: True if d.get('error') == 'Product not found' else "Wrong error message")

# TEST 20-21: Search Suggest
test_endpoint("GET /api/search/suggest?q=esp32", "GET", f"{API_BASE}/search/suggest?q=esp32",
    validate_fn=lambda d: True if 'suggestions' in d and 'categories' in d else "Missing suggestions or categories")

test_endpoint("GET /api/search/suggest?q=", "GET", f"{API_BASE}/search/suggest?q=",
    validate_fn=lambda d: True if len(d.get('suggestions', [])) == 0 else "Expected empty suggestions")

# TEST 22-23: Newsletter
test_endpoint("POST /api/newsletter (valid)", "POST", f"{API_BASE}/newsletter",
    json_body={"email": "newsletter@voltmart.com"},
    validate_fn=lambda d: True if d.get('ok') is True else "Newsletter subscription failed")

test_endpoint("POST /api/newsletter (invalid)", "POST", f"{API_BASE}/newsletter",
    expected_status=400,
    json_body={"email": "notanemail"},
    validate_fn=lambda d: True if d.get('error') == 'Invalid email' else "Wrong error message")

# ============================================================================
# PHASE 2 TESTS - NEW FEATURES
# ============================================================================
print("\n" + "=" * 80)
print("PHASE 2 TESTS - New Auth, User-Protected, and Admin Features")
print("=" * 80)

# ============================================================================
# AUTH TESTS (8 tests)
# ============================================================================
print("\n" + "=" * 80)
print("AUTH TESTS")
print("=" * 80)

# TEST 24: Register new user
user_email = random_email()
success, data = test_endpoint(
    "POST /api/auth/register",
    "POST",
    f"{API_BASE}/auth/register",
    json_body={"name": "John Smith", "email": user_email, "password": "SecurePass123!"},
    validate_fn=lambda d: (
        True if (d.get('ok') is True and 
                'devOtp' in d and 
                d.get('email') == user_email)
        else f"Invalid register response: {d}"
    )
)
if success and data:
    user_otp = data.get('devOtp')
    print(f"   📧 User email: {user_email}, OTP: {user_otp}")

# TEST 25: Verify OTP
if user_otp:
    success, data = test_endpoint(
        "POST /api/auth/verify-otp",
        "POST",
        f"{API_BASE}/auth/verify-otp",
        json_body={"email": user_email, "otp": user_otp},
        validate_fn=lambda d: (
            True if ('token' in d and 
                    'user' in d and 
                    d['user'].get('email') == user_email)
            else f"Invalid verify-otp response: {d}"
        )
    )
    if success and data:
        user_token = data.get('token')
        print(f"   🔑 User token obtained")

# TEST 26: Admin login
success, data = test_endpoint(
    "POST /api/auth/login (admin)",
    "POST",
    f"{API_BASE}/auth/login",
    json_body={"email": "admin@voltmart.com", "password": "admin123"},
    validate_fn=lambda d: (
        True if ('token' in d and 
                'user' in d and 
                d['user'].get('role') == 'admin')
        else f"Invalid admin login response: {d}"
    )
)
if success and data:
    admin_token = data.get('token')
    print(f"   🔑 Admin token obtained")

# TEST 27: Login with wrong password
test_endpoint(
    "POST /api/auth/login (wrong password)",
    "POST",
    f"{API_BASE}/auth/login",
    expected_status=401,
    json_body={"email": "admin@voltmart.com", "password": "wrongpassword"},
    validate_fn=lambda d: True if d.get('error') == 'Invalid credentials' else f"Wrong error: {d.get('error')}"
)

# TEST 28: GET /api/auth/me with token
if user_token:
    test_endpoint(
        "GET /api/auth/me (with token)",
        "GET",
        f"{API_BASE}/auth/me",
        headers={"Authorization": f"Bearer {user_token}"},
        validate_fn=lambda d: (
            True if ('user' in d and 
                    d['user'].get('email') == user_email)
            else f"Invalid /me response: {d}"
        )
    )

# TEST 29: GET /api/auth/me without token
test_endpoint(
    "GET /api/auth/me (without token)",
    "GET",
    f"{API_BASE}/auth/me",
    expected_status=401,
    validate_fn=lambda d: True if d.get('error') == 'Unauthorized' else f"Wrong error: {d.get('error')}"
)

# TEST 30: Forgot password
forgot_email = random_email()
# First register this user
requests.post(f"{API_BASE}/auth/register", json={"name": "Forgot User", "email": forgot_email, "password": "OldPass123"})
success, data = test_endpoint(
    "POST /api/auth/forgot",
    "POST",
    f"{API_BASE}/auth/forgot",
    json_body={"email": forgot_email},
    validate_fn=lambda d: True if d.get('ok') is True else f"Forgot password failed: {d}"
)
if success and data:
    forgot_otp = data.get('devOtp')
    print(f"   📧 Forgot password OTP: {forgot_otp}")

# TEST 31: Reset password
if forgot_otp:
    test_endpoint(
        "POST /api/auth/reset",
        "POST",
        f"{API_BASE}/auth/reset",
        json_body={"email": forgot_email, "otp": forgot_otp, "password": "NewPass123!"},
        validate_fn=lambda d: True if d.get('ok') is True else f"Reset password failed: {d}"
    )

# ============================================================================
# USER-PROTECTED TESTS (9 tests)
# ============================================================================
print("\n" + "=" * 80)
print("USER-PROTECTED TESTS")
print("=" * 80)

if not user_token:
    print("⚠️  Skipping user-protected tests - no user token available")
else:
    auth_headers = {"Authorization": f"Bearer {user_token}"}
    
    # TEST 32: GET /api/addresses (initially empty)
    test_endpoint(
        "GET /api/addresses (empty)",
        "GET",
        f"{API_BASE}/addresses",
        headers=auth_headers,
        validate_fn=lambda d: (
            True if ('addresses' in d and 
                    isinstance(d['addresses'], list))
            else f"Invalid addresses response: {d}"
        )
    )
    
    # TEST 33: POST /api/addresses (create address)
    success, data = test_endpoint(
        "POST /api/addresses",
        "POST",
        f"{API_BASE}/addresses",
        headers=auth_headers,
        json_body={
            "name": "John Smith",
            "phone": "9876543210",
            "line1": "123 Electronics Street",
            "line2": "Tech Park",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "type": "home"
        },
        validate_fn=lambda d: (
            True if ('address' in d and 
                    'id' in d['address'])
            else f"Invalid address creation response: {d}"
        )
    )
    if success and data:
        address_id = data['address'].get('id')
        print(f"   📍 Address ID: {address_id}")
    
    # TEST 34: DELETE /api/addresses/:id
    if address_id:
        # Create another address to delete
        resp = requests.post(f"{API_BASE}/addresses", 
            headers=auth_headers,
            json={"name": "Test", "phone": "1234567890", "line1": "Test", "city": "Test", "state": "Test", "pincode": "123456", "type": "office"})
        delete_id = resp.json().get('address', {}).get('id')
        if delete_id:
            test_endpoint(
                "DELETE /api/addresses/:id",
                "DELETE",
                f"{API_BASE}/addresses/{delete_id}",
                headers=auth_headers,
                validate_fn=lambda d: True if d.get('ok') is True else f"Delete address failed: {d}"
            )
    
    # TEST 35: GET /api/wishlist (initially empty)
    test_endpoint(
        "GET /api/wishlist",
        "GET",
        f"{API_BASE}/wishlist",
        headers=auth_headers,
        validate_fn=lambda d: (
            True if ('products' in d and 
                    isinstance(d['products'], list))
            else f"Invalid wishlist response: {d}"
        )
    )
    
    # TEST 36: POST /api/wishlist (add product)
    test_endpoint(
        "POST /api/wishlist",
        "POST",
        f"{API_BASE}/wishlist",
        headers=auth_headers,
        json_body={"slug": "arduino-uno-r4-wifi-1"},
        validate_fn=lambda d: True if d.get('ok') is True else f"Add to wishlist failed: {d}"
    )
    
    # TEST 37: DELETE /api/wishlist/:slug
    test_endpoint(
        "DELETE /api/wishlist/arduino-uno-r4-wifi-1",
        "DELETE",
        f"{API_BASE}/wishlist/arduino-uno-r4-wifi-1",
        headers=auth_headers,
        validate_fn=lambda d: True if d.get('ok') is True else f"Remove from wishlist failed: {d}"
    )
    
    # TEST 38: POST /api/orders (create order)
    if address_id:
        success, data = test_endpoint(
            "POST /api/orders",
            "POST",
            f"{API_BASE}/orders",
            headers=auth_headers,
            json_body={
                "items": [{"slug": "arduino-uno-r4-wifi-1", "qty": 1}],
                "addressId": address_id,
                "paymentMethod": "cod"
            },
            validate_fn=lambda d: (
                True if ('order' in d and 
                        'id' in d['order'] and
                        'subtotal' in d['order'] and
                        'gst' in d['order'] and
                        'shipping' in d['order'] and
                        'total' in d['order'])
                else f"Invalid order creation response: {d}"
            )
        )
        if success and data:
            order_id = data['order'].get('id')
            print(f"   📦 Order ID: {order_id}")
            print(f"   💰 Subtotal: ₹{data['order'].get('subtotal')}, GST: ₹{data['order'].get('gst')}, Shipping: ₹{data['order'].get('shipping')}, Total: ₹{data['order'].get('total')}")
    
    # TEST 39: GET /api/orders (list orders)
    test_endpoint(
        "GET /api/orders",
        "GET",
        f"{API_BASE}/orders",
        headers=auth_headers,
        validate_fn=lambda d: (
            True if ('orders' in d and 
                    isinstance(d['orders'], list) and
                    len(d['orders']) > 0)
            else f"Invalid orders list response: {d}"
        )
    )
    
    # TEST 40: GET /api/orders/:id (single order)
    if order_id:
        test_endpoint(
            "GET /api/orders/:id",
            "GET",
            f"{API_BASE}/orders/{order_id}",
            headers=auth_headers,
            validate_fn=lambda d: (
                True if ('order' in d and 
                        d['order'].get('id') == order_id)
                else f"Invalid single order response: {d}"
            )
        )

# ============================================================================
# COUPONS TESTS (2 tests)
# ============================================================================
print("\n" + "=" * 80)
print("COUPONS TESTS")
print("=" * 80)

# TEST 41: Validate valid coupon
test_endpoint(
    "POST /api/coupons/validate (WELCOME10)",
    "POST",
    f"{API_BASE}/coupons/validate",
    json_body={"code": "WELCOME10", "subtotal": 2000},
    validate_fn=lambda d: (
        True if ('coupon' in d and 
                'discount' in d and
                d['discount'] == 200)
        else f"Invalid coupon validation: {d}"
    )
)

# TEST 42: Validate invalid coupon
test_endpoint(
    "POST /api/coupons/validate (INVALID)",
    "POST",
    f"{API_BASE}/coupons/validate",
    expected_status=400,
    json_body={"code": "INVALID", "subtotal": 2000},
    validate_fn=lambda d: True if d.get('error') == 'Invalid coupon' else f"Wrong error: {d.get('error')}"
)

# ============================================================================
# AI SEARCH TESTS (3 tests)
# ============================================================================
print("\n" + "=" * 80)
print("AI SEARCH TESTS")
print("=" * 80)

# TEST 43: AI search - ESP32 with camera under 1000
test_endpoint(
    "POST /api/ai-search (ESP32 with camera under 1000)",
    "POST",
    f"{API_BASE}/ai-search",
    json_body={"query": "ESP32 with camera under 1000"},
    validate_fn=lambda d: (
        True if ('products' in d and 
                isinstance(d['products'], list) and
                'parsed' in d and
                'summary' in d)
        else f"Invalid AI search response: {d}"
    )
)

# TEST 44: AI search - raspberry pi 5
test_endpoint(
    "POST /api/ai-search (raspberry pi 5)",
    "POST",
    f"{API_BASE}/ai-search",
    json_body={"query": "raspberry pi 5"},
    validate_fn=lambda d: (
        True if ('products' in d and 
                isinstance(d['products'], list) and
                'parsed' in d)
        else f"Invalid AI search response: {d}"
    )
)

# TEST 45: AI search - cheap arduino
test_endpoint(
    "POST /api/ai-search (cheap arduino)",
    "POST",
    f"{API_BASE}/ai-search",
    json_body={"query": "cheap arduino"},
    validate_fn=lambda d: (
        True if ('products' in d and 
                isinstance(d['products'], list) and
                'parsed' in d and
                d['parsed'].get('filter', {}).get('_sort') == 'price-low')
        else f"Invalid AI search response or wrong sort: {d}"
    )
)

# ============================================================================
# ADMIN TESTS (6 tests)
# ============================================================================
print("\n" + "=" * 80)
print("ADMIN TESTS")
print("=" * 80)

if not admin_token:
    print("⚠️  Skipping admin tests - no admin token available")
else:
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # TEST 46: GET /api/admin/stats
    test_endpoint(
        "GET /api/admin/stats",
        "GET",
        f"{API_BASE}/admin/stats",
        headers=admin_headers,
        validate_fn=lambda d: (
            True if ('revenue' in d and 
                    'orders' in d and
                    'users' in d and
                    d.get('products') == 48 and
                    'last7' in d and
                    isinstance(d['last7'], list) and
                    len(d['last7']) == 7 and
                    'topCats' in d and
                    'recentOrders' in d)
            else f"Invalid admin stats response: {d}"
        )
    )
    
    # TEST 47: GET /api/admin/orders
    test_endpoint(
        "GET /api/admin/orders",
        "GET",
        f"{API_BASE}/admin/orders",
        headers=admin_headers,
        validate_fn=lambda d: (
            True if ('orders' in d and 
                    isinstance(d['orders'], list))
            else f"Invalid admin orders response: {d}"
        )
    )
    
    # TEST 48: GET /api/admin/users
    test_endpoint(
        "GET /api/admin/users",
        "GET",
        f"{API_BASE}/admin/users",
        headers=admin_headers,
        validate_fn=lambda d: (
            True if ('users' in d and 
                    isinstance(d['users'], list) and
                    len(d['users']) > 0)
            else f"Invalid admin users response: {d}"
        )
    )
    
    # TEST 49: GET /api/admin/coupons
    test_endpoint(
        "GET /api/admin/coupons",
        "GET",
        f"{API_BASE}/admin/coupons",
        headers=admin_headers,
        validate_fn=lambda d: (
            True if ('coupons' in d and 
                    isinstance(d['coupons'], list) and
                    len(d['coupons']) == 3)
            else f"Invalid admin coupons response: expected 3 coupons, got {len(d.get('coupons', []))}"
        )
    )
    
    # TEST 50: PATCH /api/admin/orders/:id (update status)
    if order_id:
        test_endpoint(
            "PATCH /api/admin/orders/:id (update status)",
            "PATCH",
            f"{API_BASE}/admin/orders/{order_id}",
            headers=admin_headers,
            json_body={"status": "shipped"},
            validate_fn=lambda d: True if d.get('ok') is True else f"Update order status failed: {d}"
        )
        
        # Verify status was updated
        resp = requests.get(f"{API_BASE}/orders/{order_id}", headers={"Authorization": f"Bearer {user_token}"})
        if resp.status_code == 200:
            order_data = resp.json().get('order', {})
            if order_data.get('status') == 'shipped':
                print(f"   ✅ Order status verified as 'shipped'")
            else:
                print(f"   ⚠️  Order status is '{order_data.get('status')}', expected 'shipped'")
    
    # TEST 51: Non-admin user calling admin endpoint
    if user_token:
        test_endpoint(
            "GET /api/admin/stats (non-admin user)",
            "GET",
            f"{API_BASE}/admin/stats",
            headers={"Authorization": f"Bearer {user_token}"},
            expected_status=403,
            validate_fn=lambda d: True if d.get('error') == 'Admin only' else f"Wrong error: {d.get('error')}"
        )

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"\n✅ Passed: {passed}")
print(f"❌ Failed: {failed}")
print(f"📊 Total: {passed + failed}")
print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%\n")

print("\nDetailed Results:")
print("-" * 80)
for result in test_results:
    print(result)

print("\n" + "=" * 80)
if failed == 0:
    print("🎉 ALL TESTS PASSED!")
    print(f"✅ Phase 1: 23 tests")
    print(f"✅ Phase 2: 28 tests")
    print(f"✅ Total: 51 tests")
else:
    print(f"⚠️  {failed} TEST(S) FAILED")
print("=" * 80)

# Exit with appropriate code
exit(0 if failed == 0 else 1)
