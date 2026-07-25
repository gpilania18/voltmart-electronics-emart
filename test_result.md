#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build a production-ready premium modern electronics e-commerce marketplace (VoltMart) inspired by Robu.in / Mouser / DigiKey.
  Phase 1 MVP scope (aha moment): storefront with realistic electronics catalog auto-seeded in MongoDB, home page (hero, categories, deals, best sellers, brands, trending, why choose us, testimonials, newsletter), product listing with filters/sort, product detail with gallery/specs/description/downloads/reviews/related, AI-style instant search suggestions, cart (client-side), newsletter subscribe. Dark futuristic theme with accents #0F62FE and #00C896.

backend:
  - task: "Seed catalog & GET /api/health"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Auto-seed on first request (48 products, 19 categories, 10 brands). GET /api/health returns ok+time. GET /api/seed force re-seeds."
  - task: "GET /api/categories & /api/brands"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Returns categories and brands arrays with slug/name/icon/image/count."
  - task: "GET /api/products with filters/sort/pagination"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Query params: category, brand, q (text), minPrice/maxPrice, minRating, inStock, deal, featured, trending, bestSeller, sort (popular|newest|price-low|price-high|rating), page, limit. Returns {products, total, page, limit, pages}."
  - task: "GET /api/products/:slug (product detail + related)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Returns {product, related[8 from same category]}. 404 if not found."
  - task: "GET /api/search/suggest?q=..."
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Regex search on name/short/sku (limit 8) + category name match (limit 4). Returns {suggestions, categories}."
  - task: "POST /api/newsletter"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Upserts email into newsletter collection. Validates email format. Returns 400 on invalid."

frontend:
  - task: "Homepage (hero, categories, deals, best sellers, brands, trending, testimonials, newsletter, footer)"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Product listing view with sidebar filters & sort"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Product detail view (gallery, specs, description, downloads, reviews, related)"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Global search (Cmd+K) with instant suggestions"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Cart drawer with GST, shipping, checkout summary"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Seed catalog & GET /api/health"
    - "GET /api/products with filters/sort/pagination"
    - "GET /api/products/:slug (product detail + related)"
    - "GET /api/search/suggest?q=..."
    - "GET /api/categories & /api/brands"
    - "POST /api/newsletter"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Phase 1 MVP for VoltMart electronics marketplace complete. Backend uses Next.js API routes with MongoDB.
      Auto-seed runs on first request (48 curated realistic products across 19 categories, 10 brands).
      Please test all backend endpoints listed in test_plan. Verify:
      1) /api/health returns ok
      2) /api/categories and /api/brands each return the expected arrays
      3) /api/products supports all filter combinations (category, brand, deal=true, bestSeller=true, trending=true, price range, sort) and pagination
      4) /api/products/:slug returns product + related (using slug 'arduino-uno-r4-wifi-1' as sample)
      5) /api/search/suggest?q=esp32 returns non-empty suggestions
      6) POST /api/newsletter with a valid email returns {ok:true}; with invalid email returns 400
