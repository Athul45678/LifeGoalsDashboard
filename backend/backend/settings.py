
# # """
# # Django settings for backend project.
# # """

# # from pathlib import Path
# # from datetime import timedelta
# # from dotenv import load_dotenv
# # load_dotenv()


# # BASE_DIR = Path(__file__).resolve().parent.parent

# # SECRET_KEY = 'django-insecure-@wxyc)_n)=%-4kl^k-ct+#)_f#%ddsb027az^@+gp+w7a&)-7@'
# # DEBUG = True

# # ALLOWED_HOSTS = ["*"]

# # # ---------------------
# # # INSTALLED APPS
# # # ---------------------
# # INSTALLED_APPS = [
# #     'django.contrib.admin',
# #     'django.contrib.auth',
# #     'django.contrib.contenttypes',
# #     'django.contrib.sessions',
# #     'django.contrib.messages',
# #     'django.contrib.staticfiles',

# #     # Third-party
# #     'rest_framework',
# #     'rest_framework_simplejwt',
# #     'corsheaders',

# #     # Your apps
# #     'goals',
# # ]

# # # ---------------------
# # # MIDDLEWARE
# # # ---------------------
# # MIDDLEWARE = [
# #     'django.middleware.security.SecurityMiddleware',

# #     # CORS at top
# #     'corsheaders.middleware.CorsMiddleware',

# #     'django.contrib.sessions.middleware.SessionMiddleware',
# #     'django.middleware.common.CommonMiddleware',
# #     'django.middleware.csrf.CsrfViewMiddleware',
# #     'django.contrib.auth.middleware.AuthenticationMiddleware',
# #     'django.contrib.messages.middleware.MessageMiddleware',
# #     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# # ]

# # ROOT_URLCONF = 'backend.urls'

# # # ---------------------
# # # TEMPLATES
# # # ---------------------
# # # Important: This makes Django serve React index.html
# # TEMPLATES = [
# #     {
# #         'BACKEND': 'django.template.backends.django.DjangoTemplates',
# #         'DIRS': [BASE_DIR / "build"],   # <-- React build folder
# #         'APP_DIRS': True,
# #         'OPTIONS': {
# #             'context_processors': [
# #                 'django.template.context_processors.request',
# #                 'django.contrib.auth.context_processors.auth',
# #                 'django.contrib.messages.context_processors.messages',
# #             ],
# #         },
# #     },
# # ]

# # WSGI_APPLICATION = 'backend.wsgi.application'

# # # ---------------------
# # # DATABASE
# # # ---------------------
# # DATABASES = {
# #     'default': {
# #         'ENGINE': 'django.db.backends.sqlite3',
# #         'NAME': BASE_DIR / 'db.sqlite3',
# #     }
# # }

# # # ---------------------
# # # AUTH PASSWORD VALIDATORS
# # # ---------------------
# # AUTH_PASSWORD_VALIDATORS = [
# #     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
# #     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
# #     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
# #     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# # ]

# # # ---------------------
# # # INTERNATIONALIZATION
# # # ---------------------
# # LANGUAGE_CODE = 'en-us'
# # TIME_ZONE = 'UTC'
# # USE_I18N = True
# # USE_TZ = True

# # # ---------------------
# # # STATIC + MEDIA
# # # ---------------------
# # STATIC_URL = '/static/'

# # # React build static files
# # STATICFILES_DIRS = [
# #     BASE_DIR / "build" / "static",
# # ]

# # # For collectstatic
# # STATIC_ROOT = BASE_DIR / "staticfiles"

# # MEDIA_URL = "/media/"
# # MEDIA_ROOT = BASE_DIR / "media"

# # DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # # ---------------------
# # # CORS
# # # ---------------------
# # # NOT needed anymore because React runs from Django
# # CORS_ALLOW_ALL_ORIGINS = False

# # # ---------------------
# # # REST FRAMEWORK (JWT)
# # # ---------------------
# # REST_FRAMEWORK = {
# #     "DEFAULT_AUTHENTICATION_CLASSES": (
# #         "rest_framework_simplejwt.authentication.JWTAuthentication",
# #     ),
# #     "DEFAULT_PERMISSION_CLASSES": (
# #         "rest_framework.permissions.IsAuthenticated",
# #     ),
# # }

# # # ---------------------
# # # SIMPLE JWT CONFIG
# # # ---------------------
# # SIMPLE_JWT = {
# #     "ACCESS_TOKEN_LIFETIME": timedelta(days=3),
# #     "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
# #     "ROTATE_REFRESH_TOKENS": True,
# #     "BLACKLIST_AFTER_ROTATION": True,
# #     "LEEWAY": 30,
# #     "AUTH_HEADER_TYPES": ("Bearer",),
# #     "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
# # }

# """
# Django settings for backend project.
# """

# from pathlib import Path
# from datetime import timedelta
# from dotenv import load_dotenv
# import os       # ✅ IMPORTANT (You missed this before!)

# # Load .env file
# load_dotenv()

# BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY = 'django-insecure-@wxyc)_n)=%-4kl^k-ct+#)_f#%ddsb027az^@+gp+w7a&)-7@'
# DEBUG = True

# ALLOWED_HOSTS = ["*"]

# # ---------------------
# # INSTALLED APPS
# # ---------------------
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',

#     # Third-party
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'corsheaders',

#     # Your apps
#     'goals',
# ]

# # ---------------------
# # MIDDLEWARE
# # ---------------------
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',

#     # CORS at top
#     'corsheaders.middleware.CorsMiddleware',

#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'backend.urls'

# # ---------------------
# # TEMPLATES
# # ---------------------
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [BASE_DIR / "build"],  # React build folder
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'backend.wsgi.application'

# # ---------------------
# # DATABASE
# # ---------------------
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# # ---------------------
# # AUTH PASSWORD VALIDATORS
# # ---------------------
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]

# # ---------------------
# # INTERNATIONALIZATION
# # ---------------------
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# # ---------------------
# # STATIC + MEDIA
# # ---------------------
# STATIC_URL = '/static/'

# STATICFILES_DIRS = [
#     BASE_DIR / "build" / "static",
# ]

# STATIC_ROOT = BASE_DIR / "staticfiles"

# MEDIA_URL = "/media/"
# MEDIA_ROOT = BASE_DIR / "media"

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # ---------------------
# # CORS
# # ---------------------
# CORS_ALLOW_ALL_ORIGINS = False

# # ---------------------
# # REST FRAMEWORK (JWT)
# # ---------------------
# REST_FRAMEWORK = {
#     "DEFAULT_AUTHENTICATION_CLASSES": (
#         "rest_framework_simplejwt.authentication.JWTAuthentication",
#     ),
#     "DEFAULT_PERMISSION_CLASSES": (
#         "rest_framework.permissions.IsAuthenticated",
#     ),
# }

# # ---------------------
# # SIMPLE JWT CONFIG
# # ---------------------
# SIMPLE_JWT = {
#     "ACCESS_TOKEN_LIFETIME": timedelta(days=3),
#     "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
#     "ROTATE_REFRESH_TOKENS": True,
#     "BLACKLIST_AFTER_ROTATION": True,
#     "LEEWAY": 30,
#     "AUTH_HEADER_TYPES": ("Bearer",),
#     "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
# }


"""
Django settings for backend project.
"""
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# ---------------------------------------------------
# BASE DIR
# ---------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------
# LOAD .env (Correct Path)
# ---------------------------------------------------
load_dotenv(dotenv_path=BASE_DIR / ".env")

SECRET_KEY = 'django-insecure-@wxyc)_n)=%-4kl^k-ct+#)_f#%ddsb027az^@+gp+w7a&)-7@'
DEBUG = True

ALLOWED_HOSTS = ["*"]

# ---------------------------------------------------
# INSTALLED APPS
# ---------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Your apps
    'goals',
    'ai',
]

# ---------------------------------------------------
# MIDDLEWARE
# ---------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    # CORS middleware FIRST
    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# ---------------------------------------------------
# TEMPLATES (React build)
# ---------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "build"],  # React build folder
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ---------------------------------------------------
# DATABASE
# ---------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ---------------------------------------------------
# PASSWORD VALIDATORS
# ---------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------------------------------
# INTERNATIONALIZATION
# ---------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------
# STATIC + MEDIA
# ---------------------------------------------------
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    BASE_DIR / "build" / "static",
]

STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------
# CORS
# ---------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False

# ---------------------------------------------------
# REST FRAMEWORK (JWT)
# ---------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# ---------------------------------------------------
# SIMPLE JWT SETTINGS
# ---------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=3),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "LEEWAY": 30,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}
