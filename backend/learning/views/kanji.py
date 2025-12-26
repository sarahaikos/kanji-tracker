from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Kanji, KanjiReview
from ..serializers import KanjiSerializer


class KanjiView(APIView):
    """Get all kanji and create new kanji"""
    
    def get(self, request):
        """Get all kanji"""
        kanji_list = Kanji.objects.all()
        serializer = KanjiSerializer(kanji_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Add new kanji"""
        serializer = KanjiSerializer(data=request.data)
        
        if serializer.is_valid():
            kanji = serializer.save()
            
            # Create initial review entry
            KanjiReview.objects.get_or_create(kanji=kanji)
            
            response_serializer = KanjiSerializer(kanji)
            return Response({
                'success': True,
                'message': 'Kanji created successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

