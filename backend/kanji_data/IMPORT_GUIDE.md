# Kanji CSV Import Guide

This guide explains how to import kanji data from CSV files into the database.

## CSV File Format

All CSV files are located in the `kanji_data/` folder. Each class has its own CSV file:
- `kanji_data/kanji_class_1.csv` - Class 1 kanji
- `kanji_data/kanji_class_2.csv` - Class 2 kanji
- `kanji_data/kanji_class_3.csv` - Class 3 kanji
- `kanji_data/kanji_class_4.csv` - Class 4 kanji
- `kanji_data/kanji_class_5.csv` - Class 5 kanji
- `kanji_data/kanji_class_6.csv` - Class 6 kanji

### CSV Columns

Each CSV file should have the following columns:
- `character` - The kanji character (single character)
- `meaning` - English meaning(s) of the kanji
- `onyomi` - Onyomi readings (音読み), separated by ・ if multiple
- `kunyomi` - Kunyomi readings (訓読み), separated by ・ if multiple
- `example_japanese` - Example word/phrase in Japanese
- `example_reading` - Reading of the example (hiragana)
- `example_meaning` - English meaning of the example


## Import Commands

### Import All Classes

To import all CSV files at once:

```bash
cd backend
source ../venv/bin/activate
python manage.py kanji_data/import_kanji_csv --all
```

### Import Specific Class

To import kanji for a specific class (e.g., class 1):

```bash
python manage.py kanji_data/import_kanji_csv --class 1
```

