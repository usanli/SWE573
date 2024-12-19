from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User

class AuthenticationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.login_url = reverse('api_token_auth')
        
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com'
        }

    def test_user_signup(self):
        response = self.client.post(
            self.signup_url,
            self.user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('token' in response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_user_login(self):
        # Create a user first
        User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        
        response = self.client.post(
            self.login_url,
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('token' in response.data) 