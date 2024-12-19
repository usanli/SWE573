from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Comment, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.URLField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['bio', 'profession', 'profile_picture', 'profile_picture_url']

    def update(self, instance, validated_data):
        print("Profile update method called with data:", validated_data)
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data.get('profile_picture')
            # Force URL update
            instance.profile_picture_url = None
            print(f"New profile picture assigned: {instance.profile_picture}")
        instance.bio = validated_data.get('bio', instance.bio)
        instance.profession = validated_data.get('profession', instance.profession)
        instance.save()
        print(f"After save - Profile Picture URL: {instance.profile_picture_url}")
        return instance

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    profile = UserProfileSerializer(read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'profile', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

    def get_profile_picture(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_picture_url:
            return obj.profile.profile_picture_url
        return None

def clean_cloudinary_url(url):
    if not url:
        return None
    
    try:
        # If URL contains the backend domain, extract the cloudinary part
        if 'swe573-backend.onrender.com' in url:
            # Try to find the full cloudinary URL pattern
            cloudinary_pattern = r'https?://res\.cloudinary\.com/[^/]+/image/upload/.*'
            import re
            match = re.search(cloudinary_pattern, url)
            if match:
                return match.group(0)
            
            # If no direct match, try to extract from the path
            parts = url.split('swe573-backend.onrender.com')
            if len(parts) > 1:
                path = parts[1]
                # Remove any leading http or https
                path = re.sub(r'^https?:?/?/?', '', path)
                # If path starts with cloudinary domain
                if path.startswith('res.cloudinary.com'):
                    return f'https://{path}'
                # If path is just the upload path
                elif '/image/upload/' in path:
                    return f'https://res.cloudinary.com{path}'
        
        # If URL is already a cloudinary URL
        if 'res.cloudinary.com' in url:
            # Ensure proper protocol and format
            url = url.replace('http://', 'https://')
            if url.startswith('//'):
                url = f'https:{url}'
            elif not url.startswith('http'):
                url = f'https://{url}'
            return url
        
        return url
    except Exception as e:
        print(f"Error cleaning URL {url}: {e}")
        return None

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'image',
                 'image_url', 'created_at', 'tags',
                 'author', 'upvotes', 'downvotes', 'eureka_comment',
                 'is_anonymous', 'parts_relation']
        read_only_fields = ['author', 'created_at', 'upvotes', 'downvotes', 
                           'eureka_comment', 'image_url']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        print("PostSerializer update method - validated data:", validated_data)
        
        # Update basic fields
        if 'title' in validated_data:
            instance.title = validated_data['title']
        if 'description' in validated_data:
            instance.description = validated_data['description']
        
        # Save and return the instance
        instance.save()
        print("Instance after save:", instance.__dict__)
        return instance

    def get_image_url(self, obj):
        return obj.image_url if obj.image_url else None

    def get_video_url(self, obj):
        return obj.video_url if obj.video_url else None

    def get_audio_url(self, obj):
        return obj.audio_url if obj.audio_url else None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_deleted:
            return None
        return representation

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at', 'author', 'parent', 'replies', 'points', 'upvotes', 'downvotes', 'tag']
