from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)
    audio = models.FileField(upload_to='audio/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)

    @property
    def points(self):
        return self.upvotes - self.downvotes

    def __str__(self):
        return self.title


class Comment(models.Model):
    TAG_CHOICES = [
        ("Question", "Question"),
        ("Hint", "Hint"),
        ("Expert Answer", "Expert Answer"),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default="Question")  # New field

    @property
    def points(self):
        return self.upvotes - self.downvotes

    def __str__(self):
        return f'Comment by {self.author} on {self.post.title}'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    def __str__(self):
        return f"{self.user.username}'s Profile"
