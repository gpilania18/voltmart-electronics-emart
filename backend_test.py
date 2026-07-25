#!/usr/bin/env python3
"""
VoltMart Backend API Test Suite
Tests all backend endpoints defined in /app/app/api/[[...path]]/route.js
"""
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

print(f"Testing VoltMart API at: {API_BASE}\n")
print("=" * 80)

# Track test results
passed = 0
failed = 0
test_results = []

def test_endpoint(name, method, url, expected_status=200, json_body=None, validate_fn=None):
    """Helper function to test an endpoint"""
    global passed, failed
    try:
        print(f"\n🧪 Testing: {name}")
        print(f"   {method} {url}")
        
        if method == 'GET':
            response = requests.get(url, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=json_body, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   Status: {response.status_code}")
        
        # Check status code
        if response.status_code != expected_status:
            print(f"   ❌ FAILED: Expected status {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            failed += 1
            test_results.append(f"❌ {name}: Status {response.status_code} (expected {expected_status})")
            return False
        
        # Parse JSON response
        try:
            data = response.json()
        except Exception:
            if expected_status == 200:
                print(f"   ❌ FAILED: Could not parse JSON response")
                print(f"   Response: {response.text[:500]}")
                failed += 1
                test_results.append(f"❌ {name}: Invalid JSON response")
                return False
            data = None
        
        # Run custom validation if provided
        if validate_fn:
            validation_result = validate_fn(data)
            if validation_result is True:
                print(f"   ✅ PASSED")
                passed += 1
                test_results.append(f"✅ {name}")
                return True
            else:
                print(f"   ❌ FAILED: {validation_result}")
                print(f"   Response: {str(data)[:500]}")
                failed += 1
                test_results.append(f"❌ {name}: {validation_result}")
                return False
        else:
            print(f"   ✅ PASSED")
            passed += 1
            test_results.append(f"✅ {name}")
            return True
            
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        failed += 1
        test_results.append(f"❌ {name}: {str(e)}")
        return False

# ============================================================================
# TEST 1: Health Check
# ============================================================================
print("\n" + "=" * 80)
print("TEST 1: Health Check")
print("=" * 80)

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

# ============================================================================
# TEST 2: Categories
# ============================================================================
print("\n" + "=" * 80)
print("TEST 2: Categories")
print("=" * 80)

categories_data = None

def validate_categories(data):
    global categories_data
    if 'categories' not in data:
        return "Missing 'categories' key"
    if not isinstance(data['categories'], list):
        return "'categories' is not an array"
    if len(data['categories']) == 0:
        return "Categories array is empty"
    
    categories_data = data['categories']
    
    # Check for expected category slugs
    slugs = [cat.get('slug') for cat in categories_data]
    expected_slugs = ['arduino', 'esp32', 'raspberry-pi', 'sensors']
    missing = [s for s in expected_slugs if s not in slugs]
    if missing:
        return f"Missing expected category slugs: {missing}"
    
    print(f"   Found {len(categories_data)} categories")
    return True

test_endpoint(
    "GET /api/categories",
    "GET",
    f"{API_BASE}/categories",
    validate_fn=validate_categories
)

# ============================================================================
# TEST 3: Brands
# ============================================================================
print("\n" + "=" * 80)
print("TEST 3: Brands")
print("=" * 80)

brands_data = None

def validate_brands(data):
    global brands_data
    if 'brands' not in data:
        return "Missing 'brands' key"
    if not isinstance(data['brands'], list):
        return "'brands' is not an array"
    if len(data['brands']) == 0:
        return "Brands array is empty"
    
    brands_data = data['brands']
    
    # Check for expected brands
    slugs = [b.get('slug') for b in brands_data]
    expected_brands = ['arduino', 'raspberry-pi', 'espressif', 'nvidia', 'dji']
    missing = [s for s in expected_brands if s not in slugs]
    if missing:
        return f"Missing expected brands: {missing}"
    
    print(f"   Found {len(brands_data)} brands")
    return True

test_endpoint(
    "GET /api/brands",
    "GET",
    f"{API_BASE}/brands",
    validate_fn=validate_brands
)

# ============================================================================
# TEST 4: Products - Basic Listing
# ============================================================================
print("\n" + "=" * 80)
print("TEST 4: Products - Basic Listing")
print("=" * 80)

products_data = None

def validate_products_basic(data):
    global products_data
    required_keys = ['products', 'total', 'page', 'limit', 'pages']
    for key in required_keys:
        if key not in data:
            return f"Missing required key: {key}"
    
    if not isinstance(data['products'], list):
        return "'products' is not an array"
    
    if data['total'] != 48:
        return f"Expected total=48, got {data['total']}"
    
    products_data = data
    print(f"   Total products: {data['total']}")
    print(f"   Page: {data['page']}, Limit: {data['limit']}, Pages: {data['pages']}")
    return True

test_endpoint(
    "GET /api/products",
    "GET",
    f"{API_BASE}/products",
    validate_fn=validate_products_basic
)

# ============================================================================
# TEST 5: Products - Filter by Category
# ============================================================================
print("\n" + "=" * 80)
print("TEST 5: Products - Filter by Category (arduino)")
print("=" * 80)

def validate_category_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for category=arduino"
    
    # Check all products have category=arduino
    non_arduino = [p for p in products if p.get('category') != 'arduino']
    if non_arduino:
        return f"Found {len(non_arduino)} products not in arduino category"
    
    print(f"   Found {len(products)} arduino products")
    return True

test_endpoint(
    "GET /api/products?category=arduino",
    "GET",
    f"{API_BASE}/products?category=arduino",
    validate_fn=validate_category_filter
)

# ============================================================================
# TEST 6: Products - Filter by Brand
# ============================================================================
print("\n" + "=" * 80)
print("TEST 6: Products - Filter by Brand (espressif)")
print("=" * 80)

def validate_brand_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for brand=espressif"
    
    # Check all products have brand=espressif
    non_espressif = [p for p in products if p.get('brand') != 'espressif']
    if non_espressif:
        return f"Found {len(non_espressif)} products not from espressif brand"
    
    print(f"   Found {len(products)} espressif products")
    return True

test_endpoint(
    "GET /api/products?brand=espressif",
    "GET",
    f"{API_BASE}/products?brand=espressif",
    validate_fn=validate_brand_filter
)

# ============================================================================
# TEST 7: Products - Filter by Deal
# ============================================================================
print("\n" + "=" * 80)
print("TEST 7: Products - Filter by Deal")
print("=" * 80)

def validate_deal_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for deal=true"
    
    # Check all products have deal=true
    non_deal = [p for p in products if not p.get('deal')]
    if non_deal:
        return f"Found {len(non_deal)} products without deal=true"
    
    print(f"   Found {len(products)} deal products")
    return True

test_endpoint(
    "GET /api/products?deal=true",
    "GET",
    f"{API_BASE}/products?deal=true",
    validate_fn=validate_deal_filter
)

# ============================================================================
# TEST 8: Products - Filter by Best Seller
# ============================================================================
print("\n" + "=" * 80)
print("TEST 8: Products - Filter by Best Seller")
print("=" * 80)

def validate_bestseller_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for bestSeller=true"
    
    # Check all products have bestSeller=true
    non_bestseller = [p for p in products if not p.get('bestSeller')]
    if non_bestseller:
        return f"Found {len(non_bestseller)} products without bestSeller=true"
    
    print(f"   Found {len(products)} best seller products")
    return True

test_endpoint(
    "GET /api/products?bestSeller=true",
    "GET",
    f"{API_BASE}/products?bestSeller=true",
    validate_fn=validate_bestseller_filter
)

# ============================================================================
# TEST 9: Products - Filter by Trending
# ============================================================================
print("\n" + "=" * 80)
print("TEST 9: Products - Filter by Trending")
print("=" * 80)

def validate_trending_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for trending=true"
    
    # Check all products have trending=true
    non_trending = [p for p in products if not p.get('trending')]
    if non_trending:
        return f"Found {len(non_trending)} products without trending=true"
    
    print(f"   Found {len(products)} trending products")
    return True

test_endpoint(
    "GET /api/products?trending=true",
    "GET",
    f"{API_BASE}/products?trending=true",
    validate_fn=validate_trending_filter
)

# ============================================================================
# TEST 10: Products - Filter by Price Range
# ============================================================================
print("\n" + "=" * 80)
print("TEST 10: Products - Filter by Price Range (1000-5000)")
print("=" * 80)

def validate_price_filter(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for price range 1000-5000"
    
    # Check all products are within price range
    out_of_range = [p for p in products if p.get('price', 0) < 1000 or p.get('price', 0) > 5000]
    if out_of_range:
        prices = [p.get('price') for p in out_of_range]
        return f"Found {len(out_of_range)} products outside price range: {prices}"
    
    print(f"   Found {len(products)} products in price range 1000-5000")
    return True

test_endpoint(
    "GET /api/products?minPrice=1000&maxPrice=5000",
    "GET",
    f"{API_BASE}/products?minPrice=1000&maxPrice=5000",
    validate_fn=validate_price_filter
)

# ============================================================================
# TEST 11: Products - Text Search
# ============================================================================
print("\n" + "=" * 80)
print("TEST 11: Products - Text Search (q=arduino)")
print("=" * 80)

def validate_text_search(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned for text search 'arduino'"
    
    print(f"   Found {len(products)} products matching 'arduino'")
    return True

test_endpoint(
    "GET /api/products?q=arduino",
    "GET",
    f"{API_BASE}/products?q=arduino",
    validate_fn=validate_text_search
)

# ============================================================================
# TEST 12: Products - Sort by Price Low
# ============================================================================
print("\n" + "=" * 80)
print("TEST 12: Products - Sort by Price (Low to High)")
print("=" * 80)

def validate_sort_price_low(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) < 2:
        return "Not enough products to validate sorting"
    
    # Check prices are in ascending order
    prices = [p.get('price', 0) for p in products]
    if prices != sorted(prices):
        return f"Products not sorted by price ascending. First 5 prices: {prices[:5]}"
    
    print(f"   Prices correctly sorted ascending: {prices[:5]}...")
    return True

test_endpoint(
    "GET /api/products?sort=price-low",
    "GET",
    f"{API_BASE}/products?sort=price-low",
    validate_fn=validate_sort_price_low
)

# ============================================================================
# TEST 13: Products - Sort by Price High
# ============================================================================
print("\n" + "=" * 80)
print("TEST 13: Products - Sort by Price (High to Low)")
print("=" * 80)

def validate_sort_price_high(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) < 2:
        return "Not enough products to validate sorting"
    
    # Check prices are in descending order
    prices = [p.get('price', 0) for p in products]
    if prices != sorted(prices, reverse=True):
        return f"Products not sorted by price descending. First 5 prices: {prices[:5]}"
    
    print(f"   Prices correctly sorted descending: {prices[:5]}...")
    return True

test_endpoint(
    "GET /api/products?sort=price-high",
    "GET",
    f"{API_BASE}/products?sort=price-high",
    validate_fn=validate_sort_price_high
)

# ============================================================================
# TEST 14: Products - Sort by Rating
# ============================================================================
print("\n" + "=" * 80)
print("TEST 14: Products - Sort by Rating")
print("=" * 80)

def validate_sort_rating(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) < 2:
        return "Not enough products to validate sorting"
    
    # Check ratings are in descending order
    ratings = [p.get('rating', 0) for p in products]
    if ratings != sorted(ratings, reverse=True):
        return f"Products not sorted by rating descending. First 5 ratings: {ratings[:5]}"
    
    print(f"   Ratings correctly sorted descending: {ratings[:5]}...")
    return True

test_endpoint(
    "GET /api/products?sort=rating",
    "GET",
    f"{API_BASE}/products?sort=rating",
    validate_fn=validate_sort_rating
)

# ============================================================================
# TEST 15: Products - Sort by Newest
# ============================================================================
print("\n" + "=" * 80)
print("TEST 15: Products - Sort by Newest")
print("=" * 80)

def validate_sort_newest(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) == 0:
        return "No products returned"
    
    print(f"   Found {len(products)} products sorted by newest")
    return True

test_endpoint(
    "GET /api/products?sort=newest",
    "GET",
    f"{API_BASE}/products?sort=newest",
    validate_fn=validate_sort_newest
)

# ============================================================================
# TEST 16: Products - Pagination Page 1
# ============================================================================
print("\n" + "=" * 80)
print("TEST 16: Products - Pagination (Page 1, Limit 10)")
print("=" * 80)

page1_products = None

def validate_pagination_page1(data):
    global page1_products
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) != 10:
        return f"Expected 10 products, got {len(products)}"
    
    if data.get('page') != 1:
        return f"Expected page=1, got {data.get('page')}"
    
    if data.get('limit') != 10:
        return f"Expected limit=10, got {data.get('limit')}"
    
    page1_products = [p.get('slug') for p in products]
    print(f"   Page 1: {len(products)} products")
    return True

test_endpoint(
    "GET /api/products?page=1&limit=10",
    "GET",
    f"{API_BASE}/products?page=1&limit=10",
    validate_fn=validate_pagination_page1
)

# ============================================================================
# TEST 17: Products - Pagination Page 2
# ============================================================================
print("\n" + "=" * 80)
print("TEST 17: Products - Pagination (Page 2, Limit 10)")
print("=" * 80)

def validate_pagination_page2(data):
    if 'products' not in data:
        return "Missing 'products' key"
    
    products = data['products']
    if len(products) != 10:
        return f"Expected 10 products, got {len(products)}"
    
    if data.get('page') != 2:
        return f"Expected page=2, got {data.get('page')}"
    
    # Check that page 2 products are different from page 1
    page2_slugs = [p.get('slug') for p in products]
    if page1_products:
        overlap = set(page1_products) & set(page2_slugs)
        if overlap:
            return f"Page 2 has overlapping products with page 1: {overlap}"
    
    print(f"   Page 2: {len(products)} products (different from page 1)")
    return True

test_endpoint(
    "GET /api/products?page=2&limit=10",
    "GET",
    f"{API_BASE}/products?page=2&limit=10",
    validate_fn=validate_pagination_page2
)

# ============================================================================
# TEST 18: Product Detail - Valid Slug
# ============================================================================
print("\n" + "=" * 80)
print("TEST 18: Product Detail - Valid Slug (arduino-uno-r4-wifi-1)")
print("=" * 80)

def validate_product_detail(data):
    if 'product' not in data:
        return "Missing 'product' key"
    
    if 'related' not in data:
        return "Missing 'related' key"
    
    product = data['product']
    related = data['related']
    
    if product.get('name') != 'Arduino Uno R4 WiFi':
        return f"Expected product name 'Arduino Uno R4 WiFi', got '{product.get('name')}'"
    
    if not isinstance(related, list):
        return "'related' is not an array"
    
    if len(related) > 8:
        return f"Expected max 8 related products, got {len(related)}"
    
    # Check all related products are from same category
    product_category = product.get('category')
    non_matching = [p for p in related if p.get('category') != product_category]
    if non_matching:
        return f"Found {len(non_matching)} related products not in category '{product_category}'"
    
    print(f"   Product: {product.get('name')}")
    print(f"   Related: {len(related)} products from category '{product_category}'")
    return True

test_endpoint(
    "GET /api/products/arduino-uno-r4-wifi-1",
    "GET",
    f"{API_BASE}/products/arduino-uno-r4-wifi-1",
    validate_fn=validate_product_detail
)

# ============================================================================
# TEST 19: Product Detail - Invalid Slug
# ============================================================================
print("\n" + "=" * 80)
print("TEST 19: Product Detail - Invalid Slug (nonexistent-slug)")
print("=" * 80)

def validate_product_not_found(data):
    if 'error' not in data:
        return "Expected 'error' key in response"
    
    if data['error'] != 'Product not found':
        return f"Expected error 'Product not found', got '{data['error']}'"
    
    print(f"   Correctly returned 404 with error message")
    return True

test_endpoint(
    "GET /api/products/nonexistent-slug",
    "GET",
    f"{API_BASE}/products/nonexistent-slug",
    expected_status=404,
    validate_fn=validate_product_not_found
)

# ============================================================================
# TEST 20: Search Suggest - With Query
# ============================================================================
print("\n" + "=" * 80)
print("TEST 20: Search Suggest - With Query (q=esp32)")
print("=" * 80)

def validate_search_suggest(data):
    if 'suggestions' not in data:
        return "Missing 'suggestions' key"
    
    if 'categories' not in data:
        return "Missing 'categories' key"
    
    suggestions = data['suggestions']
    categories = data['categories']
    
    if not isinstance(suggestions, list):
        return "'suggestions' is not an array"
    
    if not isinstance(categories, list):
        return "'categories' is not an array"
    
    if len(suggestions) == 0:
        return "Expected non-empty suggestions for 'esp32'"
    
    print(f"   Suggestions: {len(suggestions)} products")
    print(f"   Categories: {len(categories)} categories")
    return True

test_endpoint(
    "GET /api/search/suggest?q=esp32",
    "GET",
    f"{API_BASE}/search/suggest?q=esp32",
    validate_fn=validate_search_suggest
)

# ============================================================================
# TEST 21: Search Suggest - Empty Query
# ============================================================================
print("\n" + "=" * 80)
print("TEST 21: Search Suggest - Empty Query (q=)")
print("=" * 80)

def validate_search_suggest_empty(data):
    if 'suggestions' not in data:
        return "Missing 'suggestions' key"
    
    suggestions = data['suggestions']
    
    if not isinstance(suggestions, list):
        return "'suggestions' is not an array"
    
    if len(suggestions) != 0:
        return f"Expected empty suggestions for empty query, got {len(suggestions)}"
    
    print(f"   Correctly returned empty suggestions")
    return True

test_endpoint(
    "GET /api/search/suggest?q=",
    "GET",
    f"{API_BASE}/search/suggest?q=",
    validate_fn=validate_search_suggest_empty
)

# ============================================================================
# TEST 22: Newsletter - Valid Email
# ============================================================================
print("\n" + "=" * 80)
print("TEST 22: Newsletter - Valid Email")
print("=" * 80)

def validate_newsletter_valid(data):
    if 'ok' not in data:
        return "Missing 'ok' key"
    
    if data['ok'] is not True:
        return f"Expected ok=true, got {data['ok']}"
    
    print(f"   Successfully subscribed to newsletter")
    return True

test_endpoint(
    "POST /api/newsletter (valid email)",
    "POST",
    f"{API_BASE}/newsletter",
    json_body={"email": "test@voltmart.com"},
    validate_fn=validate_newsletter_valid
)

# ============================================================================
# TEST 23: Newsletter - Invalid Email
# ============================================================================
print("\n" + "=" * 80)
print("TEST 23: Newsletter - Invalid Email")
print("=" * 80)

def validate_newsletter_invalid(data):
    if 'error' not in data:
        return "Expected 'error' key in response"
    
    if data['error'] != 'Invalid email':
        return f"Expected error 'Invalid email', got '{data['error']}'"
    
    print(f"   Correctly rejected invalid email")
    return True

test_endpoint(
    "POST /api/newsletter (invalid email)",
    "POST",
    f"{API_BASE}/newsletter",
    expected_status=400,
    json_body={"email": "notanemail"},
    validate_fn=validate_newsletter_invalid
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
else:
    print(f"⚠️  {failed} TEST(S) FAILED")
print("=" * 80)

# Exit with appropriate code
exit(0 if failed == 0 else 1)
