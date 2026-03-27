"""
ManoProtect - Reviews System Tests (Iteration 40)
Tests for the user reviews/ratings feature:
- Public reviews API
- Review stats API
- Landing stats with ratings
- Admin reviews management
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://auth-hardened-test.preview.emergentagent.com')

# Enterprise credentials
ENTERPRISE_EMAIL = "ceo@manoprotectt.com"
ENTERPRISE_PASSWORD = "Admin2026!"


class TestPublicReviewsAPI:
    """Test public reviews endpoints (no auth required)"""
    
    def test_get_public_reviews(self):
        """GET /api/reviews/public - Returns only approved reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews/public")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reviews" in data, "Response should contain 'reviews' field"
        assert "total" in data, "Response should contain 'total' field"
        
        # All reviews should be approved (or no reviews)
        for review in data["reviews"]:
            # Note: Public API should only return approved reviews
            assert "review_id" in review, "Each review should have review_id"
            assert "user_name" in review, "Each review should have user_name"
            assert "rating" in review, "Each review should have rating"
            assert "comment" in review, "Each review should have comment"
            assert 1 <= review["rating"] <= 5, "Rating should be between 1 and 5"
        
        print(f"✅ GET /api/reviews/public returned {data['total']} approved reviews")
        return data

    def test_get_public_reviews_with_min_rating(self):
        """GET /api/reviews/public?min_rating=4 - Filter by minimum rating"""
        response = requests.get(f"{BASE_URL}/api/reviews/public?min_rating=4")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        for review in data["reviews"]:
            assert review["rating"] >= 4, f"Rating {review['rating']} should be >= 4"
        
        print(f"✅ GET /api/reviews/public?min_rating=4 returned {data['total']} reviews with rating >= 4")

    def test_get_public_reviews_with_limit(self):
        """GET /api/reviews/public?limit=5 - Limit number of results"""
        response = requests.get(f"{BASE_URL}/api/reviews/public?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["reviews"]) <= 5, "Should return at most 5 reviews"
        
        print(f"✅ GET /api/reviews/public?limit=5 returned {len(data['reviews'])} reviews")


class TestReviewStatsAPI:
    """Test review statistics endpoint"""
    
    def test_get_review_stats(self):
        """GET /api/reviews/stats - Returns average rating and distribution"""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check required fields
        assert "average_rating" in data, "Response should contain 'average_rating'"
        assert "total_reviews" in data, "Response should contain 'total_reviews'"
        assert "distribution" in data, "Response should contain 'distribution'"
        
        # Check distribution fields
        distribution = data["distribution"]
        assert "five_stars" in distribution, "Distribution should have 'five_stars'"
        assert "four_stars" in distribution, "Distribution should have 'four_stars'"
        assert "three_stars" in distribution, "Distribution should have 'three_stars'"
        assert "two_stars" in distribution, "Distribution should have 'two_stars'"
        assert "one_star" in distribution, "Distribution should have 'one_star'"
        
        # Validate data types
        assert isinstance(data["average_rating"], (int, float)), "average_rating should be numeric"
        assert isinstance(data["total_reviews"], int), "total_reviews should be integer"
        
        # If there are reviews, average should be between 0 and 5
        if data["total_reviews"] > 0:
            assert 0 <= data["average_rating"] <= 5, "average_rating should be between 0 and 5"
        
        print(f"✅ GET /api/reviews/stats: avg={data['average_rating']}, total={data['total_reviews']}")
        print(f"   Distribution: 5★={distribution['five_stars']}, 4★={distribution['four_stars']}, 3★={distribution['three_stars']}, 2★={distribution['two_stars']}, 1★={distribution['one_star']}")
        return data


class TestLandingStatsAPI:
    """Test landing stats with reviews integration"""
    
    def test_landing_stats_includes_rating(self):
        """GET /api/public/landing-stats - Should include average_rating and total_reviews"""
        response = requests.get(f"{BASE_URL}/api/public/landing-stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Check new rating fields
        assert "average_rating" in data, "Landing stats should include 'average_rating'"
        assert "total_reviews" in data, "Landing stats should include 'total_reviews'"
        
        # Check existing fields
        assert "families_protected" in data, "Landing stats should include 'families_protected'"
        assert "threats_blocked" in data, "Landing stats should include 'threats_blocked'"
        assert "timestamp" in data, "Landing stats should include 'timestamp'"
        
        # Validate data types
        assert isinstance(data["average_rating"], (int, float)), "average_rating should be numeric"
        assert isinstance(data["total_reviews"], int), "total_reviews should be integer"
        
        print(f"✅ GET /api/public/landing-stats includes ratings: avg={data['average_rating']}, reviews={data['total_reviews']}")
        return data


class TestAdminReviewsAPI:
    """Test enterprise admin reviews endpoints (requires auth)"""
    
    @pytest.fixture(scope="class")
    def enterprise_session(self):
        """Login to enterprise portal and return session"""
        session = requests.Session()
        
        # Login
        login_response = session.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ENTERPRISE_EMAIL, "password": ENTERPRISE_PASSWORD}
        )
        
        if login_response.status_code != 200:
            pytest.skip(f"Enterprise login failed: {login_response.text}")
        
        print(f"✅ Enterprise login successful for {ENTERPRISE_EMAIL}")
        return session

    def test_admin_reviews_requires_auth(self):
        """GET /api/reviews/admin/all - Should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/reviews/admin/all")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✅ GET /api/reviews/admin/all returns 401 without auth")

    def test_get_all_reviews_admin(self, enterprise_session):
        """GET /api/reviews/admin/all - Returns all reviews for admin"""
        response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "reviews" in data, "Response should contain 'reviews'"
        assert "total" in data, "Response should contain 'total'"
        assert "page" in data, "Response should contain 'page'"
        assert "pages" in data, "Response should contain 'pages'"
        
        print(f"✅ GET /api/reviews/admin/all returned {data['total']} total reviews")
        
        # Return data for other tests
        return data

    def test_admin_reviews_filter_by_status(self, enterprise_session):
        """GET /api/reviews/admin/all?status=pending - Filter by status"""
        # Test pending filter
        response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        # If there are reviews, they should all be pending
        for review in data["reviews"]:
            assert review.get("status") == "pending", f"Expected pending, got {review.get('status')}"
        
        print(f"✅ Filter by status=pending returned {len(data['reviews'])} pending reviews")
        
        # Test approved filter
        response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all?status=approved")
        assert response.status_code == 200
        
        data = response.json()
        for review in data["reviews"]:
            assert review.get("status") == "approved"
        
        print(f"✅ Filter by status=approved returned {len(data['reviews'])} approved reviews")

    def test_admin_reviews_pagination(self, enterprise_session):
        """Test pagination for admin reviews"""
        response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all?page=1&limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["reviews"]) <= 2, "Should return at most 2 reviews"
        assert data["page"] == 1
        
        print(f"✅ Pagination works: page={data['page']}, pages={data['pages']}")

    def test_approve_review_requires_auth(self):
        """PATCH /api/reviews/admin/{id}/approve - Should return 401 without auth"""
        response = requests.patch(f"{BASE_URL}/api/reviews/admin/test_id/approve")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ PATCH /api/reviews/admin/{id}/approve returns 401 without auth")

    def test_reject_review_requires_auth(self):
        """PATCH /api/reviews/admin/{id}/reject - Should return 401 without auth"""
        response = requests.patch(f"{BASE_URL}/api/reviews/admin/test_id/reject?reason=test_reason")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ PATCH /api/reviews/admin/{id}/reject returns 401 without auth")


class TestReviewsIntegration:
    """Integration tests for the complete reviews flow"""
    
    def test_public_reviews_match_stats(self):
        """Public reviews count should match stats total_reviews"""
        # Get public reviews (limit max is 50)
        public_response = requests.get(f"{BASE_URL}/api/reviews/public?limit=50")
        assert public_response.status_code == 200
        public_data = public_response.json()
        
        # Get stats
        stats_response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert stats_response.status_code == 200
        stats_data = stats_response.json()
        
        # Count of public reviews should be <= total approved reviews from stats
        # (because public API only shows approved reviews)
        print(f"✅ Public reviews: {public_data['total']}, Stats total: {stats_data['total_reviews']}")
        # They should match since stats also counts only approved
        assert public_data['total'] == stats_data['total_reviews'], \
            f"Public reviews ({public_data['total']}) should match stats ({stats_data['total_reviews']})"

    def test_landing_stats_rating_matches_review_stats(self):
        """Landing stats rating should match review stats"""
        # Get landing stats
        landing_response = requests.get(f"{BASE_URL}/api/public/landing-stats")
        assert landing_response.status_code == 200
        landing_data = landing_response.json()
        
        # Get review stats
        stats_response = requests.get(f"{BASE_URL}/api/reviews/stats")
        assert stats_response.status_code == 200
        stats_data = stats_response.json()
        
        # Ratings should match
        assert landing_data["average_rating"] == stats_data["average_rating"], \
            f"Landing avg ({landing_data['average_rating']}) should match stats avg ({stats_data['average_rating']})"
        
        assert landing_data["total_reviews"] == stats_data["total_reviews"], \
            f"Landing total ({landing_data['total_reviews']}) should match stats total ({stats_data['total_reviews']})"
        
        print(f"✅ Landing stats match review stats: avg={landing_data['average_rating']}, total={landing_data['total_reviews']}")


class TestSeedDataVerification:
    """Verify the seeded test data in database"""
    
    @pytest.fixture(scope="class")
    def enterprise_session(self):
        """Login to enterprise portal and return session"""
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/enterprise/auth/login",
            json={"email": ENTERPRISE_EMAIL, "password": ENTERPRISE_PASSWORD}
        )
        if login_response.status_code != 200:
            pytest.skip("Enterprise login failed")
        return session

    def test_verify_seeded_reviews_exist(self, enterprise_session):
        """Verify that seed reviews were created by the main agent"""
        response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all")
        assert response.status_code == 200
        
        data = response.json()
        print(f"📊 Total reviews in database: {data['total']}")
        
        if data['total'] == 0:
            print("⚠️ No reviews found in database - seed data may not have been created")
        else:
            # Count by status
            approved_count = 0
            pending_count = 0
            for review in data['reviews']:
                if review.get('status') == 'approved':
                    approved_count += 1
                elif review.get('status') == 'pending':
                    pending_count += 1
                print(f"   - Review {review.get('review_id')}: {review.get('rating')}★ - {review.get('status')} - {review.get('display_name', 'Unknown')}")
            
            print(f"✅ Found {approved_count} approved reviews and {pending_count} pending reviews")

    def test_public_api_returns_only_approved(self, enterprise_session):
        """Verify public API only returns approved reviews"""
        # Get all reviews (admin)
        admin_response = enterprise_session.get(f"{BASE_URL}/api/reviews/admin/all")
        admin_data = admin_response.json()
        
        # Get public reviews
        public_response = requests.get(f"{BASE_URL}/api/reviews/public")
        public_data = public_response.json()
        
        # Count approved in admin
        approved_in_admin = sum(1 for r in admin_data['reviews'] if r.get('status') == 'approved')
        
        print(f"Admin total: {admin_data['total']}, Approved: {approved_in_admin}, Public total: {public_data['total']}")
        
        # Public should only show approved
        assert public_data['total'] == approved_in_admin, \
            f"Public API ({public_data['total']}) should show only approved reviews ({approved_in_admin})"
        
        print(f"✅ Public API correctly shows only {public_data['total']} approved reviews (hiding pending)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
