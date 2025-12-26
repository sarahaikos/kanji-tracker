from django.contrib import admin
from .models import Kanji, KanjiReading, KanjiExample, KanjiReview


class KanjiReadingInline(admin.TabularInline):
    model = KanjiReading
    extra = 1


class KanjiExampleInline(admin.TabularInline):
    model = KanjiExample
    extra = 1


@admin.register(Kanji)
class KanjiAdmin(admin.ModelAdmin):
    list_display = ['character', 'meaning', 'difficulty', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['character', 'meaning']
    inlines = [KanjiReadingInline, KanjiExampleInline]


@admin.register(KanjiReview)
class KanjiReviewAdmin(admin.ModelAdmin):
    list_display = ['kanji', 'mastery_level', 'next_review', 'review_count', 'correct_count']
    list_filter = ['mastery_level', 'next_review']
    search_fields = ['kanji__character', 'kanji__meaning']
