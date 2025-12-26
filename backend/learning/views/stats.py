from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from collections import defaultdict
from ..models import Kanji, KanjiReview
from ..serializers import KanjiSerializer
from ..utils import auto_import_kanji_data


class StatsView(APIView):
    """Get dashboard statistics"""
    
    def get(self, request):
        # Auto-import kanji from CSV if database is empty
        if not Kanji.objects.exists():
            auto_import_kanji_data(silent=True)
        
        # Get total kanji count
        total_kanji = Kanji.objects.count()
        
        # Get all reviews
        all_reviews = KanjiReview.objects.all()
        
        # Get mastered kanji (mastery_level >= 5)
        mastered = all_reviews.filter(mastery_level__gte=5).count()
        
        # Get learning kanji (mastery_level < 5 or no reviews yet)
        learning = all_reviews.filter(mastery_level__lt=5).count()
        
        # Calculate total mastery points (sum of all mastery levels)
        # This gives a more granular view of progress
        total_mastery_points = sum(review.mastery_level for review in all_reviews)
        max_possible_points = total_kanji * 5  # 5 is the mastery threshold
        mastery_progress = (total_mastery_points / max_possible_points * 100) if max_possible_points > 0 else 0
        
        # Get kanji due for review (next_review <= now)
        now = timezone.now()
        due_for_review = all_reviews.filter(
            next_review__lte=now
        ).count()
        
        # Calculate streak (consecutive days with reviews)
        # For now, return 0 as streak calculation requires more complex logic
        streak = 0
        
        # Group kanji by mastery level
        kanji_by_level = defaultdict(list)
        for review in all_reviews.select_related('kanji'):
            level = review.mastery_level
            kanji_data = {
                'id': review.kanji.id,
                'character': review.kanji.character,
                'meaning': review.kanji.meaning,
                'mastery_level': level,
                'review_count': review.review_count,
                'correct_count': review.correct_count
            }
            kanji_by_level[level].append(kanji_data)
        
        # Sort levels and convert to list format
        mastery_levels = []
        for level in sorted(kanji_by_level.keys(), reverse=True):
            mastery_levels.append({
                'level': level,
                'count': len(kanji_by_level[level]),
                'kanji': kanji_by_level[level]
            })
        
        stats = {
            'total_kanji': total_kanji,
            'mastered': mastered,
            'learning': learning,
            'due_for_review': due_for_review,
            'streak': streak,
            'total_mastery_points': total_mastery_points,
            'mastery_progress': round(mastery_progress, 1),
            'mastery_levels': mastery_levels
        }
        return Response(stats, status=status.HTTP_200_OK)

