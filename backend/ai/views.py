from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from goals.models import Goal, Task
from openai import OpenAI
import os

# -----------------------------------------------------
# LOAD API KEY SAFELY FROM .env
# -----------------------------------------------------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# -----------------------------------------------------
# 1️⃣ AI – SMART SUGGESTIONS
# -----------------------------------------------------
class AISuggestions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        goal_id = request.data.get("goal_id")

        # Validate goal
        try:
            goal = Goal.objects.get(id=goal_id, user=request.user)
        except Goal.DoesNotExist:
            return Response({"error": "Goal not found"}, status=404)

        prompt = f"""
        You are an AI productivity coach.

        Generate 3 short, unique, simple improvement suggestions 
        for this goal. Do NOT repeat the same text always.

        ----
        Goal Title: {goal.title}
        Description: {goal.description}
        Category: {goal.category}
        Priority: {goal.priority}
        Start: {goal.start_date}
        End: {goal.end_date}
        ----
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=180
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        text = response.choices[0].message.content.strip()

        # Clean into list
        suggestions = [
            s.replace("•", "").replace("-", "").strip()
            for s in text.split("\n")
            if s.strip()
        ]

        return Response({"list": suggestions[:3]})


# -----------------------------------------------------
# 2️⃣ AI – GENERATE TASKS
# -----------------------------------------------------
class AIGenerateTasks(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        goal_id = request.data.get("goal_id")
        count = int(request.data.get("count", 3))

        try:
            goal = Goal.objects.get(id=goal_id, user=request.user)
        except Goal.DoesNotExist:
            return Response({"error": "Goal not found"}, status=404)

        prompt = f"""
        Generate {count} actionable, practical tasks for the goal:

        "{goal.title}"

        Return ONLY tasks, one per line.
        No numbers, no bullets, no explanation.
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        text = response.choices[0].message.content.strip()

        tasks = [
            t.replace("-", "").replace("•", "").strip()
            for t in text.split("\n")
            if t.strip()
        ]

        return Response({"tasks": tasks[:count]})


# -----------------------------------------------------
# 3️⃣ AI – ADD GENERATED TASKS TO DATABASE
# -----------------------------------------------------
class AIAddTasks(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        goal_id = request.data.get("goal_id")
        tasks = request.data.get("tasks", [])

        # Validate goal
        try:
            goal = Goal.objects.get(id=goal_id, user=request.user)
        except Goal.DoesNotExist:
            return Response({"error": "Goal not found"}, status=404)

        # Save each task
        for title in tasks:
            Task.objects.create(goal=goal, title=title)

        return Response({"success": True})
