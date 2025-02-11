from django.conf import settings
from django.contrib import admin
from django.http.response import HttpResponseRedirect
from django.urls import include
from django.urls import path
from django.urls import re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from .urls import urlpatterns


def webpack_redirect_view(request):
    return HttpResponseRedirect(
        "http://127.0.0.1:4000/__open-in-editor?{query}".format(
            query=request.GET.urlencode()
        )
    )


schema_view = get_schema_view(
    openapi.Info(
        title="Kolibri Studio API",
        default_version="v0",
        description="Kolibri Studio Swagger API",
        license=openapi.License(name="MIT"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = urlpatterns + [
    re_path(r"^__open-in-editor/", webpack_redirect_view),
    path('admin/', admin.site.urls),
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    re_path(
        r"^api_explorer/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    re_path(
        r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"
    ),
    re_path(r"^api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]

if getattr(settings, "DEBUG_PANEL_ACTIVE", False):

    import debug_toolbar

    urlpatterns = [re_path(r"^__debug__/", include(debug_toolbar.urls))] + urlpatterns
