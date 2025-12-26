from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from ..models import Kanji, KanjiReview
from ..serializers import KanjiSerializer


class ReviewView(APIView):
    """Get kanji for review and submit review results"""
    
    def get(self, request):
        """Get kanji for review"""
        # Get kanji that are due for review (next_review <= now)
        # Or get kanji that haven't been reviewed yet
        now = timezone.now()
        
        # First, try to get kanji that are due for review
        review = KanjiReview.objects.filter(
            next_review__lte=now
        ).order_by('next_review').first()
        
        # If no kanji are due, get one that hasn't been reviewed yet
        if not review:
            review = KanjiReview.objects.filter(
                review_count=0
            ).first()
        
        # If still no kanji, get any kanji
        if not review:
            review = KanjiReview.objects.first()
        
        if not review:
            return Response({
                'error': 'No kanji available for review'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Serialize the kanji with all related data
        serializer = KanjiSerializer(review.kanji)
        kanji_data = serializer.data
        kanji_data['next_review'] = review.next_review.isoformat()
        
        return Response(kanji_data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Submit review result"""
        kanji_id = request.data.get('kanji_id')
        result = request.data.get('result')  # 'correct', 'incorrect', 'hard'
        
        try:
            kanji = Kanji.objects.get(id=kanji_id)
            review, created = KanjiReview.objects.get_or_create(kanji=kanji)
            
            # Update review statistics
            review.review_count += 1
            review.last_reviewed = timezone.now()
            
            if result == 'correct':
                review.correct_count += 1
                review.mastery_level += 1
                # Increase time until next review (spaced repetition)
                days_until_review = min(30, review.mastery_level * 2)
                review.next_review = timezone.now() + timedelta(days=days_until_review)
            elif result == 'hard':
                # Keep same level, review again soon
                review.next_review = timezone.now() + timedelta(days=1)
            else:  # incorrect
                # Reset or decrease mastery level
                review.mastery_level = max(0, review.mastery_level - 1)
                review.next_review = timezone.now() + timedelta(days=1)
            
            review.save()
            
            return Response({
                'success': True,
                'message': f'Review submitted for kanji {kanji_id} with result: {result}'
            }, status=status.HTTP_200_OK)
        except Kanji.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Kanji not found'
            }, status=status.HTTP_404_NOT_FOUND)

