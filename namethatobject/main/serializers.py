from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Comment, Tag, UserProfile

class UserSerializer(serializers.ModelSerializer):
    # Only necessary fields for user creation
    email = serializers.EmailField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Create the User object
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email')
        )
        
        # Create an empty UserProfile associated with the User (if required)
        UserProfile.objects.create(user=user)
        
        return user

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'wikidata_id', 'description']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.PrimaryKeyRelatedField(many=True, read_only=True)  # Show only reply IDs
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at', 'author', 'parent', 'replies']

class PostSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True)  # Accept tags as a list of IDs
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'image', 'video', 'audio', 'created_at', 'tags', 'comments']
