
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following_posts, name="following_posts"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("profile/setup", views.profile_setup, name="profile_setup"),

    # API Routes
    path("post", views.share_post, name="post"),
    # change to `post/<int:post_id>/edit`
    path("post/<int:post_id>", views.edit_post, name="edit_post"),
    path("profile/<str:username>/follow", views.follow, name="follow"),
    path("profile/<str:username>/unfollow", views.unfollow, name="unfollow"),
    path("post/<int:post_id>/like", views.like_post, name="like_post"),
    path("post/<int:post_id>/unlike", views.unlike_post, name="unlike_post"),
    path("post/<int:post_id>/comment", views.comment, name="comment"),
    path("post/<int:comment_id>/reply", views.comment_reply, name="comment_reply"),
    path("comment/<int:comment_id>/like", views.like_comment, name="like_comment"),
    path("comment/<int:comment_id>/unlike", views.unlike_comment, name="unlike_comment")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
