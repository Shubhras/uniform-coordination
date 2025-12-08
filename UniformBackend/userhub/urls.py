from django.urls import path
from userhub.views import *

urlpatterns = [
    path('', DummyView.as_view(), name='home'),
    # other paths...
]
