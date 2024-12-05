from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Comment, UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

    def get_profile_picture(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_picture:
            return obj.profile.profile_picture.url
        return None

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    eureka_comment = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'image', 'video', 'audio', 'created_at', 'tags', 'author', 'points', 'upvotes', 'downvotes', 'eureka_comment', 'is_anonymous']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at', 'author', 'parent', 'replies', 'points', 'upvotes', 'downvotes', 'tag']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'bio', 'profession', 'profile_picture']
