from rest_framework import serializers
from .models import Kanji, KanjiReading, KanjiExample, KanjiReview


class KanjiReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanjiReading
        fields = ['reading', 'reading_type']


class KanjiExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanjiExample
        fields = ['japanese', 'reading', 'meaning']


class KanjiSerializer(serializers.ModelSerializer):
    readings = KanjiReadingSerializer(many=True, read_only=True)
    examples = KanjiExampleSerializer(many=True, read_only=True)
    
    # For input, we'll accept readings and examples as nested data
    onyomi = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    kunyomi = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    example_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Kanji
        fields = [
            'id', 'character', 'meaning', 'difficulty',
            'readings', 'examples', 'created_at',
            'onyomi', 'kunyomi', 'example_data'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        # Extract nested data
        onyomi_list = validated_data.pop('onyomi', [])
        kunyomi_list = validated_data.pop('kunyomi', [])
        example_data_list = validated_data.pop('example_data', [])
        
        # Create kanji
        kanji = Kanji.objects.create(**validated_data)
        
        # Create readings
        for reading in onyomi_list:
            KanjiReading.objects.create(
                kanji=kanji,
                reading=reading,
                reading_type='onyomi'
            )
        
        for reading in kunyomi_list:
            KanjiReading.objects.create(
                kanji=kanji,
                reading=reading,
                reading_type='kunyomi'
            )
        
        # Create examples
        for example in example_data_list:
            KanjiExample.objects.create(
                kanji=kanji,
                japanese=example.get('japanese', ''),
                reading=example.get('reading', ''),
                meaning=example.get('meaning', '')
            )
        
        return kanji
    
    def to_representation(self, instance):
        """Custom representation to match frontend expected format"""
        representation = super().to_representation(instance)
        
        # Group readings by type
        readings_dict = {'onyomi': [], 'kunyomi': []}
        for reading in instance.readings.all():
            if reading.reading_type == 'onyomi':
                readings_dict['onyomi'].append(reading.reading)
            else:
                readings_dict['kunyomi'].append(reading.reading)
        
        representation['readings'] = readings_dict
        
        return representation

