from django.test import TestCase, Client
from .models import User, Post, Comment
from selenium import webdriver
# Create your tests here.

class UserTestCase(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="testuser1",
            email="test1@test.com",
            password="asd"
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="test2@test.com",
            password="sdf"
        )

    