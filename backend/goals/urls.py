from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    GoalViewSet,
    TaskViewSet,
    ProfileViewSet,
    HabitViewSet,
    signup_user,
    change_username,
    change_password,
)

router = DefaultRouter()
router.register(r"goals", GoalViewSet, basename="goals")
router.register(r"tasks", TaskViewSet, basename="tasks")
router.register(r"profile", ProfileViewSet, basename="profile")
router.register(r"habits", HabitViewSet, basename="habits")   # ← ADD HERE

urlpatterns = [
    path("signup/", signup_user),
    path("profile/change-username/", change_username),
    path("profile/change-password/", change_password),
    path("", include(router.urls)),
]
