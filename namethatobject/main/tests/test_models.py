from django.test import TestCase
from django.contrib.auth.models import User
from main.models import Post, Comment, UserProfile

class PostModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            description='Test Description',
            author=self.user,
            tags=['test', 'mystery']
        )

    def test_post_creation(self):
        self.assertEqual(self.post.title, 'Test Post')
        self.assertEqual(self.post.description, 'Test Description')
        self.assertEqual(self.post.author, self.user)
        self.assertEqual(self.post.tags, ['test', 'mystery'])

    def test_post_str_representation(self):
        self.assertEqual(str(self.post), 'Test Post')

    def test_post_points(self):
        self.post.upvotes = 10
        self.post.downvotes = 3
        self.post.save()
        self.assertEqual(self.post.points, 7)

class CommentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            description='Test Description',
            author=self.user
        )
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            text='Test Comment',
            tag='Question'
        )

    def test_comment_creation(self):
        self.assertEqual(self.comment.text, 'Test Comment')
        self.assertEqual(self.comment.author, self.user)
        self.assertEqual(self.comment.tag, 'Question')

    def test_comment_str_representation(self):
        expected = f'Comment by {self.user.username} on {self.post.title}'
        self.assertEqual(str(self.comment), expected) 