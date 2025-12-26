from django.db import models
from django.utils import timezone


class Kanji(models.Model):
    """Model to store kanji characters and their information"""
    character = models.CharField(max_length=1, unique=True, help_text="The kanji character")
    meaning = models.TextField(help_text="English meaning(s) of the kanji")
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.character} - {self.meaning}"


class KanjiReading(models.Model):
    """Model to store readings (onyomi/kunyomi) for kanji"""
    READING_TYPES = [
        ('onyomi', 'Onyomi (音読み)'),
        ('kunyomi', 'Kunyomi (訓読み)'),
    ]
    
    kanji = models.ForeignKey(Kanji, on_delete=models.CASCADE, related_name='readings')
    reading = models.CharField(max_length=50, help_text="The reading in hiragana/katakana")
    reading_type = models.CharField(max_length=10, choices=READING_TYPES)
    
    class Meta:
        unique_together = ['kanji', 'reading', 'reading_type']
    
    def __str__(self):
        return f"{self.kanji.character} - {self.reading} ({self.reading_type})"


class KanjiExample(models.Model):
    """Model to store example words/phrases using the kanji"""
    kanji = models.ForeignKey(Kanji, on_delete=models.CASCADE, related_name='examples')
    japanese = models.CharField(max_length=100, help_text="Japanese text containing the kanji")
    reading = models.CharField(max_length=200, help_text="Reading in hiragana")
    meaning = models.TextField(help_text="English meaning of the example")
    
    def __str__(self):
        return f"{self.japanese} ({self.reading}) - {self.meaning}"


class KanjiReview(models.Model):
    """Model to track review status and spaced repetition data"""
    kanji = models.ForeignKey(Kanji, on_delete=models.CASCADE, related_name='reviews')
    mastery_level = models.IntegerField(default=0, help_text="Mastery level (0=learning, higher=mastered)")
    next_review = models.DateTimeField(default=timezone.now)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    review_count = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['kanji']
    
    def __str__(self):
        return f"{self.kanji.character} - Level {self.mastery_level}"
