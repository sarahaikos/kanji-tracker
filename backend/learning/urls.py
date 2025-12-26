from django.urls import path
from .views.review import ReviewView
from .views.stats import StatsView
from .views.kanji import KanjiView

urlpatterns = [
    path('review/', ReviewView.as_view(), name='review'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('kanji/', KanjiView.as_view(), name='kanji'),
]

