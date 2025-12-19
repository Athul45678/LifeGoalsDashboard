from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone


# ---------------------------------------------------
# GOAL MODEL
# ---------------------------------------------------
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goals")

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    start_date = models.DateField()
    end_date = models.DateField()

    category = models.CharField(max_length=100, default="General")
    priority = models.CharField(max_length=10, default="Medium")  # High/Medium/Low

    progress = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    # Drag-and-drop sorting
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


# ---------------------------------------------------
# TASK MODEL  (✅ now with created_at + completed_at)
# ---------------------------------------------------
class Task(models.Model):
    goal = models.ForeignKey(Goal, related_name="tasks", on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    # NEW
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        """
        Automatically maintain completed_at:
        - when completed flips False -> True → set completed_at = now
        - when completed flips True -> False → clear completed_at
        """
        if self.pk:
            old = Task.objects.get(pk=self.pk)
            if not old.completed and self.completed and self.completed_at is None:
                # just completed
                self.completed_at = timezone.now()
            elif old.completed and not self.completed:
                # un-completed
                self.completed_at = None
        else:
            # new task
            if self.completed and self.completed_at is None:
                self.completed_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.goal.title}"


# ---------------------------------------------------
# USER PROFILE MODEL
# ---------------------------------------------------
def avatar_upload_path(instance, filename):
    return f"avatars/user_{instance.user.id}/{filename}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )

    avatar = models.ImageField(upload_to=avatar_upload_path, blank=True, null=True)
    bio = models.TextField(blank=True)
    theme = models.CharField(max_length=10, default="light")  # dark/light

    def __str__(self):
        return f"{self.user.username}'s Profile"


# ---------------------------------------------------
# HABITS + COMPLETIONS
# ---------------------------------------------------
class Habit(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="habits"
    )
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name="habits"
    )
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user})"


class HabitCompletion(models.Model):
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name="completions"
    )
    date = models.DateField()

    class Meta:
        unique_together = ("habit", "date")  # one record per day

    def __str__(self):
        return f"{self.habit.title} @ {self.date}"



