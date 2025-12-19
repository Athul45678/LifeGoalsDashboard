from rest_framework import serializers
from datetime import timedelta

from .models import (
    Goal,
    Task,
    UserProfile,
    Habit,
    HabitCompletion,
)


# -----------------------------
# TASK + GOAL + PROFILE
# -----------------------------
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        # completed_at is handled in model.save, frontend just reads it
        read_only_fields = ("created_at", "completed_at")


class GoalSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = "__all__"
        read_only_fields = ("user", "progress", "is_completed", "order")

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        # include id so frontend can PATCH /profile/<id>/
        fields = ["id", "username", "bio", "avatar", "theme"]


# -----------------------------
# HABITS
# -----------------------------
class HabitSerializer(serializers.ModelSerializer):
    goal_title = serializers.SerializerMethodField()
    completed_dates = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            "id",
            "title",
            "goal",
            "goal_title",
            "created_at",
            "completed_dates",
            "streak",
        ]

    def get_goal_title(self, obj):
        return obj.goal.title

    def get_completed_dates(self, obj):
        # return list of "YYYY-MM-DD" strings
        dates = obj.completions.values_list("date", flat=True)
        return [d.isoformat() for d in dates]

    def get_streak(self, obj):
        """
        Calculates current streak: consecutive days ending at last completed day
        """
        qs = obj.completions.order_by("-date").values_list("date", flat=True)
        dates = list(qs)
        if not dates:
            return 0

        streak = 1
        current = dates[0]

        for d in dates[1:]:
            if (current - d) == timedelta(days=1):
                streak += 1
                current = d
            else:
                break
        return streak
