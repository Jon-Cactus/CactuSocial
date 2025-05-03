from django.contrib import admin
from .models import User, Profile, Post, Comment

# Register your models here.
class PostAdmin(admin.ModelAdmin):
    list_display = ("profile", "content", "timestamp")
    readonly_fields = ("get_likes",)

    def get_likes(self, obj):
        return ", ".join([profile.user.username for profile in obj.likes.select_related('user').all()])
    get_likes.short_description = "Likes"

class UserAdmin(admin.ModelAdmin):
    pass

class ProfileAdmin(admin.ModelAdmin):
    list_display = ("get_username", "get_following", "get_followers", "bio")
    readonly_fields = ("display_followers",)

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = "username"

    def get_following(self, obj):
        return ", ".join([profile.user.username for profile in obj.following.all()])
    get_following.short_description = "Following"

    def get_followers(self, obj):
        return ", ".join([profile.user.username for profile in obj.followers.all()])
    get_followers.short_description = "Followers"

    def display_followers(self, obj):
        return ", ".join([profile.user.username for profile in obj.followers.all()])
    display_followers.short_description = "Followers"

class CommentAdmin(admin.ModelAdmin):
    list_display = ("profile", "post", "text", "timestamp")

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
