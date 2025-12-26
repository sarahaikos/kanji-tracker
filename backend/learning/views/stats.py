from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..models import Kanji, KanjiReview


class StatsView(APIView):
    """Get dashboard statistics"""
    
    def get(self, request):
        # Get total kanji count
        total_kanji = Kanji.objects.count()
        
        # Get mastered kanji (mastery_level >= 5)
        mastered = KanjiReview.objects.filter(mastery_level__gte=5).count()
        
        # Get learning kanji (mastery_level < 5 or no reviews yet)
        learning = KanjiReview.objects.filter(mastery_level__lt=5).count()
        
        # Get kanji due for review (next_review <= now)
        now = timezone.now()
        due_for_review = KanjiReview.objects.filter(
            next_review__lte=now
        ).count()
        
        # Calculate streak (consecutive days with reviews)
        # For now, return 0 as streak calculation requires more complex logic
        streak = 0
        
        stats = {
            'total_kanji': total_kanji,
            'mastered': mastered,
            'learning': learning,
            'due_for_review': due_for_review,
            'streak': streak
        }
        return Response(stats, status=status.HTTP_200_OK)

