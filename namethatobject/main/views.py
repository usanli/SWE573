from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, get_object_or_404  # Import get_object_or_404
from .models import Post

def post_list(request):
    posts = Post.objects.all()
    return render(request, 'main/post_list.html', {'posts': posts})

def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    return render(request, 'main/post_detail.html', {'post': post})
