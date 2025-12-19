
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# AI views
from ai.views import AISuggestions, AIGenerateTasks, AIAddTasks

urlpatterns = [
    path("admin/", admin.site.urls),

    # Main app
    path("api/", include("goals.urls")),

    # JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # AI API Endpoints
    path("api/ai/suggestions/", AISuggestions.as_view()),
    path("api/ai/generate_tasks/", AIGenerateTasks.as_view()),
    path("api/ai/add_tasks/", AIAddTasks.as_view()),
]

# Media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# -----------------------------
# React Frontend Catch-All Route
# -----------------------------
# Any URL that doesn't match API should load React index.html
urlpatterns += [
    re_path(r"^(?!api/).*", TemplateView.as_view(template_name="index.html")),
]
