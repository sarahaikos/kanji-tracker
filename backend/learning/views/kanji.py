from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Kanji, KanjiReview
from ..serializers import KanjiSerializer
from ..utils import auto_import_kanji_data, check_kanji_in_csv


class KanjiView(APIView):
    """Get all kanji and create new kanji"""
    
    def get(self, request):
        """Get all kanji, optionally filtered by class"""
        # Auto-import kanji from CSV if database is empty
        if not Kanji.objects.exists():
            auto_import_kanji_data(silent=True)
        
        kanji_list = Kanji.objects.all()
        
        # Filter by class if provided
        class_level = request.query_params.get('class', None)
        if class_level:
            try:
                class_level = int(class_level)
                kanji_list = kanji_list.filter(class_level=class_level)
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid class parameter. Must be a number between 1-6.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KanjiSerializer(kanji_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Add new kanji"""
        character = request.data.get('character', '').strip()
        
        # Check if kanji already exists in CSV files
        if character:
            csv_class = check_kanji_in_csv(character)
            if csv_class is not None:
                return Response({
                    'success': False,
                    'error': f'This kanji ("{character}") already exists in Class {csv_class}. Please use the learn page to study this kanji instead of adding them manually.',
                    'csv_class': csv_class
                }, status=status.HTTP_400_BAD_REQUEST)
        
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

