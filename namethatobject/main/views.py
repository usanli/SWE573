from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, generics, status, filters
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from .models import Post, Comment, UserProfile
from .forms import CommentForm
from .serializers import PostSerializer, CommentSerializer, UserSerializer, UserProfileSerializer
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.authtoken.views import ObtainAuthToken
import subprocess
from django.db.models import Q
import os

def post_list(request):
    posts = Post.objects.all()
    return render(request, 'main/post_list.html', {'posts': posts})

def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = post.comments.all()
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
            return redirect('post_detail', post_id=post.id)
    else:
        form = CommentForm()

    return render(request, 'main/post_detail.html', {
        'post': post,
        'comments': comments,
        'form': form
    })

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Post.objects.filter(is_deleted=False)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(tags__icontains=search_query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if user is the author
        if instance.author != request.user:
            return Response(
                {'error': 'You do not have permission to edit this post'},
                status=403
            )

        # Print debug information
        print("Request data:", request.data)
        print("Request content type:", request.content_type)
        
        # Handle both PATCH and PUT requests
        partial = kwargs.pop('partial', False)
        
        # Extract only allowed fields
        allowed_fields = ['title', 'description']
        update_data = {}
        
        # Handle both regular data and JSON string
        data = request.data
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return Response({'error': 'Invalid JSON data'}, status=400)
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        print("Update data:", update_data)

        # Perform update
        serializer = self.get_serializer(
            instance, 
            data=update_data, 
            partial=partial
        )

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            print("Updated instance:", serializer.data)
            return Response(serializer.data)
        except Exception as e:
            print("Update error:", str(e))
            return Response({'error': str(e)}, status=400)

    def perform_update(self, serializer):
        print("Performing update with data:", serializer.validated_data)
        serializer.save()
        print("Update saved successfully")

    # Remove partial_update method to avoid conflicts
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        post = self.get_object()
        post.upvotes += 1
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        post = self.get_object()
        post.downvotes += 1
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()

        # Check if user is the author
        if post.author != request.user:
            return Response(
                {"error": "Only the author can delete this post"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if the post has comments
        if post.comments.exists():
            return Response(
                {"error": "Cannot delete a post with comments"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Check if user is the author
        if comment.author != request.user:
            return Response(
                {"error": "Only the author can delete this comment"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check if comment is an eureka comment
        post = comment.post
        if post.eureka_comment == comment.id:
            return Response(
                {"error": "Cannot delete a eureka comment"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        comment = self.get_object()
        comment.upvotes += 1
        comment.save()
        return Response(
            {
                'points': comment.points,
                'upvotes': comment.upvotes,
                'downvotes': comment.downvotes,
                'tag': comment.tag  # Include the tag in the response
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        comment = self.get_object()
        comment.downvotes += 1
        comment.save()
        return Response(
            {
                'points': comment.points,
                'upvotes': comment.upvotes,
                'downvotes': comment.downvotes,
                'tag': comment.tag  # Include the tag in the response
            },
            status=status.HTTP_200_OK
        )



class SignUpView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "username": user.username
        }, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, username=None):
        if username:
            user = get_object_or_404(User, username=username)
        else:
            user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                print("Valid data:", serializer.validated_data)  # Debug print
                serializer.save()
                return Response(serializer.data)
            print("Invalid data:", serializer.errors)  # Debug print
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            import traceback
            print(traceback.format_exc())  # Print full traceback
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        # Add this method to handle PUT requests as well
        return self.patch(request)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    try:
        user = request.user
        
        # Get all user's posts
        posts = Post.objects.filter(author=user)
        
        # Handle posts based on comments
        for post in posts:
            comment_count = Comment.objects.filter(post=post).count()
            if comment_count > 0:
                # If post has comments, mark as anonymous
                post.anonymize()
            else:
                # If no comments, mark as deleted
                post.is_deleted = True
                post.save()

        # Anonymize all comments
        Comment.objects.filter(author=user).update(is_anonymous=True)
        
        # Delete the user
        user.delete()
        
        return Response({"message": "Account successfully deleted"}, 
                      status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.pk,
                'username': user.username,
                'is_admin': user.is_staff,
                'email': user.email
            }
        })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def run_tests(request):
    try:
        suite = request.data.get('suite', 'all')
        test_type = request.data.get('type', 'frontend')  # Add test type parameter
        
        if test_type == 'backend':
            # Run Django backend tests
            command = ['python', 'manage.py', 'test']
            if suite != 'all':
                command.append(suite)
                
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
        else:
            # Run frontend tests
            command = ['npm', 'test']
            if suite != 'all':
                command.extend(['--', f'tests/{suite}'])
                
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                cwd='/app',  # Use absolute path in production
                env={
                    **os.environ,
                    'CI': 'true',
                    'NODE_ENV': 'test'
                }
            )
        
        return Response({
            'success': result.returncode == 0,
            'output': result.stdout,
            'errors': result.stderr
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error running tests: {str(e)}. Current directory: {os.getcwd()}'
        }, status=500)
