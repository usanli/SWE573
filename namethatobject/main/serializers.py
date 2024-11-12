from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Comment, UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']  # Make sure 'password' and 'email' are included
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at', 'author', 'parent', 'replies']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)  # Use UserSerializer for detailed author info

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'image', 'video', 'audio', 'created_at', 'tags', 'author']
