from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Comment, Tag
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    surname = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField(write_only=True)
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'name', 'surname', 'date_of_birth']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Extract profile-specific fields
        name = validated_data.pop('name')
        surname = validated_data.pop('surname')
        date_of_birth = validated_data.pop('date_of_birth')
        email = validated_data.pop('email')
        
        # Create the User object
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=email
        )
        
        # Create the UserProfile object
        UserProfile.objects.create(
            user=user,
            name=name,
            surname=surname,
            date_of_birth=date_of_birth
        )
        
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