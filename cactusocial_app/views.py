import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.http import require_POST, require_http_methods
from django.utils import timezone
from .models import User, Profile, Post, Comment, CommentReply
from .forms import ProfileForm

# Tool for generating views
def post_paginator(request, query, template, title, **kwargs):
    paginator = Paginator(query, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, template, {
        "page_obj": page_obj,
        "title": title,
        **kwargs # Optional context arguments
    })


def index(request):
    return post_paginator(
        request,
        query=Post.objects.select_related("profile").order_by("-timestamp"),
        template="cactusocial_app/index.html",
        title="All Posts",
    )

@login_required
def following_posts(request):
    return post_paginator(
        request,
        query=Post.objects.select_related("profile").filter(profile__in=request.user.profile.following.all()).order_by("-timestamp"),
        template="cactusocial_app/following.html",
        title="Following",
    )

def profile(request, username):
    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        pass # TODO render error page
    
    is_following = None # Handle anonymous users
    if request.user.is_authenticated:
        is_following = user_obj.profile in request.user.profile.following.all()

    return post_paginator(
        request,
        query=user_obj.profile.posts.select_related("profile").order_by("-timestamp"),
        template="cactusocial_app/profile.html",
        title=f"{user_obj.username}'s Profile",
        user_obj=user_obj,
        is_following=is_following
        )


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "cactusocial_app/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "cactusocial_app/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "cactusocial_app/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            Profile.objects.create(user=user)
        except IntegrityError:
            return render(request, "cactusocial_app/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("profile_setup"))
    else:
        return render(request, "cactusocial_app/register.html")
    

def profile_setup(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            return redirect("index")
    else:
        form = ProfileForm(instance=request.user.profile)
    return render(request, "cactusocial_app/profile_setup.html", {"form": form})
    

"""
API endpoints
"""

@login_required
def update_profile(request):
    if request.method == "POST" or "PUT":
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            return JsonResponse({
                "success": True,
                "profile_picture_url": request.user.profile.profile_picture_url if request.user.profile.profile_picture_url else None,
                "bio": request.user.profile.bio if request.user.profile.bio else None
            })
        else:
            return JsonResponse({"success": False, "errors": form.errors})
    return JsonResponse({"success": False, "error": "Invalid request method"}, status=400)


@login_required
def share_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # grab all information from form object
    data = json.loads(request.body)
    content = data.get("content", "").strip() # isolate content
    if not content:
        return JsonResponse({"error": "Can't share empty posts!"}, status=400)
    # create and save post
    post = Post(profile=request.user.profile, content=content)
    try:
        post.save()
        return JsonResponse({"message": "Post shared successfully!"}, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Failed to save post: {str(e)}"}, status=500)


@login_required
def edit_post(request, post_id):
    # Ensure this route is accessed only by PUT
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    # Ensure post exists
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    #  Prevent the user from manually inputting the URL to edit a post
    if post.profile.user != request.user:
        return JsonResponse({"error": "You are not authorized to edit this post!"}, status=403)
    # grab all information from form object
    data = json.loads(request.body)
    updated_content = data.get("updatedContent")
    if updated_content is not None: # Ensure form is not empty
        post.content = updated_content
        post.edited_timestamp = timezone.now()
        post.save()
        return JsonResponse({
            "message": "Post updated successfully.",
            "post": {
                "content": post.content,
                "timestamp": post.timestamp.isoformat(),
                "edited_timestamp": post.edited_timestamp.isoformat() if post.edited_timestamp else None
            }
        }, status=200)
    else:
        return JsonResponse({"error": "Can't save empty posts!"}, status=400)

@login_required
@require_POST
def like_post(request, post_id):
    try: # Ensure post exists
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)
    # Add the user to the post's likes
    profile = request.user.profile
    post.likes.add(profile)

    return JsonResponse({"message": "Liked post!",
                         "is_liked": True,
                         "like_count": post.like_count}, status=200)

@login_required
@require_http_methods(["DELETE"])
def unlike_post(request, post_id):
    try: # ensure post exists
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)
    # remove the user's profile from the post's likes
    profile = request.user.profile
    post.likes.remove(profile)

    return JsonResponse({
        "message": "Unliked post!",
        "is_liked": False,
        "like_count": post.like_count}, status=200)


@login_required
@require_POST
def comment(request, post_id):
    try: # Ensure post exists
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)
    
    data = json.loads(request.body)
    content = data.get("content", "").strip()
    if not content:
        return JsonResponse({"error": "Cannot post empty comments!"}, status=400)
    
    comment = Comment(profile=request.user.profile, post=post, text=content)
    try:
        comment.save()
    except Exception as e:
        return JsonResponse({"error": f"Failed to post comment: {str(e)}"}, status=400)
    return JsonResponse({
        "message": "Comment posted successfully!",
        "comment": {
            "username": comment.profile.user.username,
            "text": comment.text,
            "timestamp": comment.timestamp.isoformat(),
            # TODO: move to edit_comment function
            # TODO: reply count
        }
    })


@login_required
@require_POST
def comment_reply(request, comment_id):
    try: # Ensure comment exists
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comment not found"}, status=404)
    
    data = json.loads(request.body)
    text = data.get("text", "").strip()
    if not text:
        return JsonResponse({"error": "Cannot post empty replies!"}, status=400)
    
    profile = request.user.profile
    comment_reply = CommentReply(profile=profile, comment=comment, text=text)
    try:
        comment_reply.save()
    except Exception as e:
        return JsonResponse({"error": f"Failed to post reply: {str(e)}"}, status=400)
    return JsonResponse({
        "message": "Reply posted successfully!",
        "comment_reply": {
            "username": comment_reply.profile.user.username,
            "recipient_username": comment.profile.user.username,
            "text": comment_reply.text,
            "timestamp": comment_reply.timestamp
        }})


@login_required
@require_POST
def like_comment(request, comment_id):
    try: # Ensure comment exists
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comment not found"}, status=404)
    
    profile = request.user.profile
    comment.likes.add(profile)

    return JsonResponse({
        "message": "Liked comment!",
        "is_liked": True,
        "like_count": comment.like_count}, status=200)
    

@login_required
@require_http_methods(["DELETE"])
def unlike_comment(request, comment_id):
    try: # Ensure comment exists
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comment not found"}, status=404)
    
    profile = request.user.profile
    comment.likes.remove(profile)

    return JsonResponse({
        "message": "Unliked comment!",
        "is_liked": False,
        "like_count": comment.like_count}, status=200)
          

@login_required
@require_POST
def follow(request, username):

    try: # Ensure user exists
        target_user = Profile.objects.get(user__username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    # Check edge cases
    if request.user.profile == target_user: #
        return JsonResponse({"error": "Cannot follow/unfollow yourself!"}, status=400)
    if request.user.profile.following.filter(id=target_user.id).exists():
        return JsonResponse({"error": f"Already following {username}"}, status=400)
    
    request.user.profile.following.add(target_user)
    return JsonResponse({"message": f"Followed {username}",
                         "following": True,
                         "follower_count": target_user.follower_count}, status=201)


@login_required
@require_http_methods(['DELETE'])
def unfollow(request, username):

    try: # Ensure user exists
        target_user = Profile.objects.get(user__username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    # Check edge cases
    if request.user.profile == target_user:
        return JsonResponse({"error": "Cannot follow/unfollow yourself!"}, status=400)
    if not request.user.profile.following.filter(id=target_user.id).exists():
        return JsonResponse({"error": f"Not following {username}"}, status=400)

    request.user.profile.following.remove(target_user)
    return JsonResponse({"message": f"Unfollowed {username}",
                         "following": False,
                         "follower_count": target_user.follower_count}, status=200)
