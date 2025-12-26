from django.apps import AppConfig
import os


class LearningConfig(AppConfig):
    name = 'learning'
    
    def ready(self):
        """Auto-import kanji data from CSV files on startup if database is empty"""
        # Only run when Django is fully initialized (not during migrations)
        import sys
        
        # Skip during migrations, collectstatic, and other management commands
        if any(cmd in sys.argv for cmd in ['migrate', 'makemigrations', 'collectstatic', 'test', 'shell']):
            return
        
        # Only run in the main process (not in reloader subprocess)
        if os.environ.get('RUN_MAIN') != 'true':
            return
        
        try:
            from .utils import auto_import_kanji_data
            auto_import_kanji_data(silent=True)
        except Exception as e:
            # Silently fail if there's an issue (e.g., during migrations, database not ready)
            # In development, you might want to log this
            pass
