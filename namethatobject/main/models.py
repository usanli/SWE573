from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from cloudinary.models import CloudinaryField
from cloudinary.utils import cloudinary_url

class Post(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = CloudinaryField('image', folder='mystery_images', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    video = CloudinaryField('video', folder='mystery_videos', blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    audio = CloudinaryField('audio', folder='mystery_audio', blank=True, null=True, resource_type='raw')
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    eureka_comment = models.IntegerField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    parts_relation = models.TextField(blank=True, null=True)

    @property
    def points(self):
        return self.upvotes - self.downvotes

    def __str__(self):
        return self.title

    def anonymize(self):
        self.is_anonymous = True
        self.save()

    def save(self, *args, **kwargs):
        try:
            if self.image:
                # Get the direct Cloudinary URL
                if hasattr(self.image, 'url'):
                    cloudinary_url = self.image.url
                    if cloudinary_url:
                        # Ensure HTTPS
                        cloudinary_url = cloudinary_url.replace('http://', 'https://')
                        self.image_url = cloudinary_url
                        print(f"Image URL set to: {cloudinary_url}")  # Debug log
                else:
                    print("Image exists but no URL available yet")

            if self.video:
                if hasattr(self.video, 'url'):
                    cloudinary_url = self.video.url
                    if cloudinary_url:
                        cloudinary_url = cloudinary_url.replace('http://', 'https://')
                        self.video_url = cloudinary_url
                        print(f"Video URL set to: {cloudinary_url}")  # Debug log

            if self.audio:
                if hasattr(self.audio, 'url'):
                    cloudinary_url = self.audio.url
                    if cloudinary_url:
                        cloudinary_url = cloudinary_url.replace('http://', 'https://')
                        self.audio_url = cloudinary_url
                        print(f"Audio URL set to: {cloudinary_url}")  # Debug log
                
        except Exception as e:
            print(f"Error setting media URLs: {e}")
            import traceback
            print(traceback.format_exc())
        
        # Save first to ensure the file is uploaded
        super().save(*args, **kwargs)
        
        # Try to set URLs again after save if they weren't set before
        try:
            if self.image and not self.image_url and hasattr(self.image, 'url'):
                cloudinary_url = self.image.url
                if cloudinary_url:
                    cloudinary_url = cloudinary_url.replace('http://', 'https://')
                    self.image_url = cloudinary_url
                    print(f"Image URL set after save: {cloudinary_url}")
                    super().save(update_fields=['image_url'])
        except Exception as e:
            print(f"Error setting image URL after save: {e}")


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
    is_anonymous = models.BooleanField(default=False)

    @property
    def points(self):
        return self.upvotes - self.downvotes

    def __str__(self):
        return f'Comment by {self.author} on {self.post.title}'

    def anonymize(self):
        self.is_anonymous = True
        self.save()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = CloudinaryField('image', folder='profile_pictures', blank=True, null=True)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True)
    profession = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        try:
            if self.profile_picture and not self.profile_picture_url:
                # Get the URL from Cloudinary
                self.profile_picture_url = self.profile_picture.url
                print(f"Profile picture URL set to: {self.profile_picture_url}")  # Debug log
        except Exception as e:
            print(f"Error setting profile picture URL: {e}")
            import traceback
            print(traceback.format_exc())
        
        super().save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
