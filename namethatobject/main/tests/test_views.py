from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from main.models import Post, Comment

class PostViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.post_data = {
            'title': 'Test Post',
            'description': 'Test Description',
            'tags': ['test', 'mystery']
        }

    def test_create_post(self):
        response = self.client.post(
            reverse('post-list'),
            self.post_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.get().title, 'Test Post')

    def test_list_posts(self):
        Post.objects.create(
            title='Test Post',
            description='Test Description',
            author=self.user
        )
        response = self.client.get(reverse('post-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class CommentViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.post = Post.objects.create(
            title='Test Post',
            description='Test Description',
            author=self.user
        )
        
        self.comment_data = {
            'post': self.post.id,
            'text': 'Test Comment',
            'tag': 'Question'
        }

    def test_create_comment(self):
        response = self.client.post(
            reverse('comment-list'),
            self.comment_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Comment.objects.get().text, 'Test Comment')

    def test_list_comments(self):
        Comment.objects.create(
            post=self.post,
            author=self.user,
            text='Test Comment',
            tag='Question'
        )
        response = self.client.get(reverse('comment-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) 