#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class CodeVerseAPITester:
    def __init__(self, base_url="https://learn-build-share-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.test_project_slug = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
            self.failed_tests.append({"test": test_name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_result(name, False, error_msg)
                return None

        except Exception as e:
            self.log_result(name, False, f"Request failed: {str(e)}")
            return None

    def test_inquiry_submission(self):
        """Test inquiry form submission (public endpoint)"""
        inquiry_data = {
            "name": "Test Student",
            "email": f"test.inquiry.{int(time.time())}@example.com",
            "phone": "+91 9876543210",
            "course_interest": "Web Development Bootcamp",
            "message": "I am interested in learning web development"
        }
        
        result = self.run_test(
            "Submit Inquiry Form",
            "POST",
            "inquiry",
            201,
            data=inquiry_data
        )
        
        return result is not None

    def test_get_all_projects(self):
        """Test getting all projects (public endpoint)"""
        result = self.run_test(
            "Get All Projects (Public)",
            "GET",
            "projects",
            200
        )
        
        return result is not None

    def test_auth_without_token(self):
        """Test protected endpoints without authentication"""
        # Should return 401 for protected endpoints
        self.run_test(
            "Auth Check - No Token (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        self.run_test(
            "Dashboard Stats - No Token (Should Fail)",
            "GET",
            "dashboard/stats",
            401
        )

    def set_test_session(self, session_token, user_id):
        """Set test session token and user ID"""
        self.session_token = session_token
        self.test_user_id = user_id
        print(f"🔑 Using test session token: {session_token[:20]}...")
        print(f"👤 Test user ID: {user_id}")

    def test_auth_with_token(self):
        """Test authentication with valid token"""
        if not self.session_token:
            self.log_result("Auth Check - With Token", False, "No session token provided")
            return False
            
        result = self.run_test(
            "Auth Check - With Token",
            "GET",
            "auth/me",
            200
        )
        
        return result is not None

    def test_dashboard_stats(self):
        """Test dashboard stats (protected)"""
        result = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if result:
            expected_keys = ['total_projects', 'total_views']
            for key in expected_keys:
                if key not in result:
                    self.log_result(f"Dashboard Stats - Missing {key}", False, f"Key {key} not found in response")
                    return False
            
            self.log_result("Dashboard Stats - Structure Check", True)
        
        return result is not None

    def test_create_project(self):
        """Test creating a new project"""
        project_data = {
            "title": f"Test Project {int(time.time())}",
            "description": "This is a test project created by the automated testing system. It includes comprehensive testing of the project creation API endpoint.",
            "images": [
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
                "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600"
            ],
            "demo_link": "https://example-demo.com",
            "github_link": "https://github.com/test/test-project",
            "tech_stack": ["React", "Node.js", "MongoDB", "Express"]
        }
        
        result = self.run_test(
            "Create Project",
            "POST",
            "projects",
            201,
            data=project_data
        )
        
        if result:
            self.test_project_id = result.get('project_id')
            self.test_project_slug = result.get('slug')
            print(f"📝 Created test project: {self.test_project_id} (slug: {self.test_project_slug})")
        
        return result is not None

    def test_get_my_projects(self):
        """Test getting current user's projects"""
        result = self.run_test(
            "Get My Projects",
            "GET",
            "dashboard/projects",
            200
        )
        
        return result is not None

    def test_get_project_by_slug(self):
        """Test getting a specific project by slug"""
        if not self.test_project_slug:
            self.log_result("Get Project by Slug", False, "No test project slug available")
            return False
            
        result = self.run_test(
            "Get Project by Slug",
            "GET",
            f"projects/{self.test_project_slug}",
            200
        )
        
        if result:
            # Check if views were incremented
            views = result.get('views', 0)
            if views > 0:
                self.log_result("Project Views Increment", True)
            else:
                self.log_result("Project Views Increment", False, "Views not incremented")
        
        return result is not None

    def test_update_project(self):
        """Test updating a project"""
        if not self.test_project_id:
            self.log_result("Update Project", False, "No test project ID available")
            return False
            
        update_data = {
            "title": f"Updated Test Project {int(time.time())}",
            "description": "This project has been updated by the automated testing system.",
            "tech_stack": ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
        }
        
        result = self.run_test(
            "Update Project",
            "PUT",
            f"projects/{self.test_project_id}",
            200,
            data=update_data
        )
        
        return result is not None

    def test_student_profile(self):
        """Test getting student profile (public)"""
        # Use a test student name - we'll use the current test user
        result = self.run_test(
            "Get Student Profile",
            "GET",
            "student/test-user",
            200
        )
        
        return result is not None

    def test_delete_project(self):
        """Test deleting a project (should be last test)"""
        if not self.test_project_id:
            self.log_result("Delete Project", False, "No test project ID available")
            return False
            
        result = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{self.test_project_id}",
            200
        )
        
        return result is not None

    def test_logout(self):
        """Test logout functionality"""
        result = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        return result is not None

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CodeVerse Institute API Testing")
        print("=" * 60)
        
        # Test public endpoints first
        print("\n📋 Testing Public Endpoints...")
        self.test_inquiry_submission()
        self.test_get_all_projects()
        
        # Test auth without token
        print("\n🔒 Testing Authentication (Without Token)...")
        self.test_auth_without_token()
        
        # Check if we have a test session
        if not self.session_token:
            print("\n⚠️  No test session token provided. Skipping protected endpoint tests.")
            print("   To test protected endpoints, create a test user and session using:")
            print("   mongosh commands from /app/auth_testing.md")
        else:
            # Test protected endpoints
            print("\n🔐 Testing Protected Endpoints...")
            self.test_auth_with_token()
            self.test_dashboard_stats()
            self.test_create_project()
            self.test_get_my_projects()
            
            if self.test_project_slug:
                self.test_get_project_by_slug()
            
            if self.test_project_id:
                self.test_update_project()
            
            self.test_student_profile()
            
            # Delete test project (cleanup)
            if self.test_project_id:
                self.test_delete_project()
            
            self.test_logout()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"   • {failed['test']}: {failed['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = CodeVerseAPITester()
    
    # Check if session token is provided as argument
    if len(sys.argv) > 1:
        session_token = sys.argv[1]
        user_id = sys.argv[2] if len(sys.argv) > 2 else "test-user"
        tester.set_test_session(session_token, user_id)
    
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())