import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from learning.models import Kanji, KanjiReading, KanjiExample, KanjiReview
from learning.utils import import_kanji_from_csv


class Command(BaseCommand):
    help = 'Import kanji from CSV files (kanji_class_1.csv, kanji_class_2.csv, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Specific CSV file to import (e.g., kanji_class_1.csv)',
        )
        parser.add_argument(
            '--class',
            type=int,
            help='Import kanji for a specific class (1-6)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Import all class CSV files',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing kanji before importing',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing kanji...')
            Kanji.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared all kanji'))

        # Get the kanji_data directory path
        # BASE_DIR points to backend/, so kanji_data is in backend/kanji_data/
        if hasattr(settings, 'BASE_DIR'):
            kanji_data_dir = os.path.join(settings.BASE_DIR, 'kanji_data')
        else:
            # Fallback: go up from command file to backend/, then to kanji_data
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            kanji_data_dir = os.path.join(base_dir, 'kanji_data')
        
        if options['all']:
            # Import all class files
            for class_num in range(1, 7):
                filename = f'kanji_class_{class_num}.csv'
                filepath = os.path.join(kanji_data_dir, filename)
                if os.path.exists(filepath):
                    self.import_csv(filepath, class_num)
                else:
                    self.stdout.write(self.style.WARNING(f'File not found: {filepath}'))
        elif options['class']:
            class_num = options['class']
            filename = f'kanji_class_{class_num}.csv'
            filepath = os.path.join(kanji_data_dir, filename)
            if os.path.exists(filepath):
                self.import_csv(filepath, class_num)
            else:
                self.stdout.write(self.style.ERROR(f'File not found: {filepath}'))
        elif options['file']:
            # Extract class number from filename
            filename = options['file']
            try:
                class_num = int(filename.split('_')[-1].split('.')[0])
            except (ValueError, IndexError):
                self.stdout.write(self.style.ERROR('Could not determine class number from filename'))
                return
            
            if os.path.exists(filename):
                self.import_csv(filename, class_num)
            else:
                self.stdout.write(self.style.ERROR(f'File not found: {filename}'))
        else:
            self.stdout.write(self.style.ERROR('Please specify --file, --class, or --all'))

    def import_csv(self, filepath, class_num):
        """Import kanji from a CSV file"""
        self.stdout.write(f'Importing kanji from {os.path.basename(filepath)} (Class {class_num})...')
        
        imported_count, skipped_count = import_kanji_from_csv(filepath, class_num, silent=False)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully imported {imported_count} kanji, updated {skipped_count} existing kanji for Class {class_num}'
            )
        )

