import csv
import os
from pathlib import Path
from django.conf import settings
from .models import Kanji, KanjiReading, KanjiExample, KanjiReview


def import_kanji_from_csv(filepath, class_num, silent=False):
    """Import kanji from a CSV file"""
    imported_count = 0
    skipped_count = 0
    
    if not os.path.exists(filepath):
        if not silent:
            print(f'File not found: {filepath}')
        return imported_count, skipped_count
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            character = row.get('character', '').strip()
            if not character:
                continue
            
            # Check if kanji already exists
            kanji, created = Kanji.objects.get_or_create(
                character=character,
                defaults={
                    'meaning': row.get('meaning', '').strip(),
                    'class_level': class_num,
                    'difficulty': 'medium'
                }
            )
            
            if not created:
                # Update existing kanji
                kanji.meaning = row.get('meaning', '').strip()
                kanji.class_level = class_num
                kanji.save()
                # Clear existing readings and examples
                kanji.readings.all().delete()
                kanji.examples.all().delete()
                skipped_count += 1
            else:
                imported_count += 1
            
            # Add onyomi readings
            onyomi = row.get('onyomi', '').strip()
            if onyomi:
                for reading in onyomi.split('・'):
                    reading = reading.strip()
                    if reading:
                        KanjiReading.objects.get_or_create(
                            kanji=kanji,
                            reading=reading,
                            reading_type='onyomi'
                        )
            
            # Add kunyomi readings
            kunyomi = row.get('kunyomi', '').strip()
            if kunyomi:
                for reading in kunyomi.split('・'):
                    reading = reading.strip()
                    if reading:
                        KanjiReading.objects.get_or_create(
                            kanji=kanji,
                            reading=reading,
                            reading_type='kunyomi'
                        )
            
            # Add examples - support multiple examples
            # Format: Multiple examples separated by ||, each example as japanese::reading::meaning
            # Or use the old format with separate columns (for backward compatibility)
            examples_data = []
            
            # Check for new format: example column with || separator
            example_field = row.get('example', '').strip()
            if example_field:
                # New format: example1||example2||example3 where each is japanese::reading::meaning
                for example_str in example_field.split('||'):
                    example_str = example_str.strip()
                    if not example_str:
                        continue
                    parts = example_str.split('::')
                    if len(parts) >= 2:
                        japanese = parts[0].strip()
                        reading = parts[1].strip() if len(parts) > 1 else ''
                        meaning = parts[2].strip() if len(parts) > 2 else ''
                        if japanese and meaning:
                            examples_data.append({
                                'japanese': japanese,
                                'reading': reading,
                                'meaning': meaning
                            })
            
            # Also support old format with separate columns (for backward compatibility)
            example_japanese = row.get('example_japanese', '').strip()
            example_reading = row.get('example_reading', '').strip()
            example_meaning = row.get('example_meaning', '').strip()
            
            if example_japanese and example_meaning:
                examples_data.append({
                    'japanese': example_japanese,
                    'reading': example_reading,
                    'meaning': example_meaning
                })
            
            # Create all examples
            for example_data in examples_data:
                KanjiExample.objects.get_or_create(
                    kanji=kanji,
                    japanese=example_data['japanese'],
                    defaults={
                        'reading': example_data['reading'],
                        'meaning': example_data['meaning']
                    }
                )
            
            # Create review entry if it doesn't exist
            KanjiReview.objects.get_or_create(kanji=kanji)
    
    return imported_count, skipped_count


def auto_import_kanji_data(silent=True):
    """Automatically import all kanji from CSV files if database is empty"""
    # Check if kanji already exist
    if Kanji.objects.exists():
        return False  # Already has data, skip import
    
    # Get the base directory (project root)
    # BASE_DIR in settings points to backend/, so we need to go up one level
    if hasattr(settings, 'BASE_DIR'):
        base_dir = str(settings.BASE_DIR.parent)
    else:
        # Fallback: go up from learning/utils.py -> learning/ -> backend/ -> project root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    
    kanji_data_dir = os.path.join(base_dir, 'kanji_data')
    
    if not os.path.exists(kanji_data_dir):
        if not silent:
            print(f'Kanji data directory not found: {kanji_data_dir}')
        return False
    
    total_imported = 0
    total_skipped = 0
    
    # Import all class files
    for class_num in range(1, 7):
        filename = f'kanji_class_{class_num}.csv'
        filepath = os.path.join(kanji_data_dir, filename)
        
        if os.path.exists(filepath):
            imported, skipped = import_kanji_from_csv(filepath, class_num, silent=silent)
            total_imported += imported
            total_skipped += skipped
            if not silent:
                print(f'Imported {imported} kanji, updated {skipped} existing kanji for Class {class_num}')
    
    if not silent and total_imported > 0:
        print(f'Auto-imported {total_imported} kanji from CSV files')
    
    return total_imported > 0


def check_kanji_in_csv(character):
    """
    Check if a kanji character exists in any CSV file.
    Returns the class number if found, None otherwise.
    """
    # Get the base directory (project root)
    if hasattr(settings, 'BASE_DIR'):
        base_dir = Path(settings.BASE_DIR).parent
    else:
        # Fallback: go up from learning/utils.py -> learning/ -> backend/ -> project root
        base_dir = Path(__file__).parent.parent.parent.parent
    
    kanji_data_dir = base_dir / 'kanji_data'
    
    if not kanji_data_dir.exists():
        return None
    
    # Check all class CSV files
    for class_num in range(1, 7):
        filename = f'kanji_class_{class_num}.csv'
        filepath = kanji_data_dir / filename
        
        if not filepath.exists():
            continue
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    csv_character = row.get('character', '').strip()
                    if csv_character == character:
                        return class_num
        except Exception:
            # If there's an error reading the file, continue to next file
            continue
    
    return None

