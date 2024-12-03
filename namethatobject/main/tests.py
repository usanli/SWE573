from django.test import TestCase
from django.contrib.auth.models import User
from .models import Post, Comment

class CommentModelTest(TestCase):
    def setUp(self):
        # Create a user and a post for testing
        self.user = User.objects.create_user(username="testuser", password="password")
        self.post = Post.objects.create(
            title="Test Post",
            description="A test post",
            author=self.user
        )

    def test_create_comment_with_tag(self):
        # Create a comment with a specific tag
        comment = Comment.objects.create(
            post=self.post,
            text="This is a test comment with a tag.",
            author=self.user,
            tag="Hint"
        )
        self.assertEqual(comment.tag, "Hint")

    def test_default_tag(self):
        # Create a comment without specifying a tag
        comment = Comment.objects.create(
            post=self.post,
            text="This is a test comment without a tag.",
            author=self.user
        )
        self.assertEqual(comment.tag, "Question")  # Default value

    def test_change_comment_tag(self):
        # Change the tag of an existing comment
        comment = Comment.objects.create(
            post=self.post,
            text="This is a test comment with an initial tag.",
            author=self.user,
            tag="Question"
        )
        comment.tag = "Expert Answer"
        comment.save()
        self.assertEqual(comment.tag, "Expert Answer")
