from datetime import date
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Goal, Task, UserProfile, Habit, HabitCompletion
from .serializers import (
    GoalSerializer,
    TaskSerializer,
    UserProfileSerializer,
    HabitSerializer,
)


# -----------------------------
# SIGNUP API (PUBLIC)
# -----------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def signup_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    User.objects.create_user(username=username, password=password)
    return Response({"success": True}, status=status.HTTP_201_CREATED)


# -----------------------------
# GOALS VIEWSET (USER-BASED)
# -----------------------------
class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by("order")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def reorder(self, request, pk=None):
        goal = self.get_object()
        new_order = request.data.get("order")

        if new_order is None:
            return Response(
                {"error": "Order value required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        goal.order = new_order
        goal.save()
        return Response({"success": True})


# -----------------------------
# TASKS VIEWSET
# -----------------------------
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only tasks of goals belonging to logged-in user
        return Task.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        task = serializer.save()
        self.update_goal_progress(task.goal)

    def perform_update(self, serializer):
        task = serializer.save()
        self.update_goal_progress(task.goal)

    def perform_destroy(self, instance):
        goal = instance.goal
        instance.delete()
        self.update_goal_progress(goal)

    def update_goal_progress(self, goal):
        tasks = goal.tasks.all()
        total = tasks.count()
        done = tasks.filter(completed=True).count()

        goal.progress = int((done / total) * 100) if total > 0 else 0
        goal.is_completed = goal.progress == 100
        goal.save()


# -----------------------------
# PROFILE VIEWSET
# -----------------------------
class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    # GET /api/profile/
    def list(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    # PATCH /api/profile/<id>/ works with default update()


# -----------------------------
# CHANGE USERNAME
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_username(request):
    new_username = request.data.get("username")

    if not new_username:
        return Response(
            {"error": "Username is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=new_username).exclude(id=request.user.id).exists():
        return Response(
            {"error": "Username already taken"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.username = new_username
    request.user.save()

    UserProfile.objects.get_or_create(user=request.user)

    return Response(
        {
            "success": True,
            "username": request.user.username,
        }
    )


# -----------------------------
# CHANGE PASSWORD
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"error": "Old and new password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not request.user.check_password(old_password):
        return Response(
            {"error": "Old password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(new_password, user=request.user)
    except ValidationError as e:
        return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    return Response({"success": True})


# -----------------------------
# HABIT VIEWSET
# -----------------------------
class HabitViewSet(viewsets.ModelViewSet):
    """
    /api/habits/          GET, POST
    /api/habits/<id>/     GET, PUT, PATCH, DELETE
    /api/habits/<id>/toggle/   POST
    """
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).select_related("goal")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """
        Toggle completion for TODAY for this habit.
        If already completed today -> uncheck.
        If not -> mark completed today.
        """
        habit = self.get_object()
        today = date.today()

        completion, created = HabitCompletion.objects.get_or_create(
            habit=habit, date=today
        )

        if not created:
            # already exists -> remove (uncheck)
            completion.delete()
            message = "unchecked"
        else:
            message = "checked"

        serializer = self.get_serializer(habit)
        return Response(
            {"status": message, "habit": serializer.data},
            status=status.HTTP_200_OK,
        )


