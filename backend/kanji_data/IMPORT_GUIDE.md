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

### Required Columns

- `character` - Single kanji character (required)
- `meaning` - Meaning of the kanji (required)

### Optional Columns

- `onyomi` - Onyomi (音読み) readings, separated by `・` (middle dot)
- `kunyomi` - Kunyomi (訓読み) readings, separated by `・` (middle dot)
- `example` - Multiple examples in new format (see below)
- `example_japanese` - Single example Japanese text (old format, for backward compatibility)
- `example_reading` - Single example reading (old format, for backward compatibility)
- `example_meaning` - Single example meaning (old format, for backward compatibility)

## Multiple Values Format

### Onyomi and Kunyomi

Multiple readings are separated by `・` (middle dot):

```
onyomi: せい・しょう
kunyomi: いきる・うまれる
```

### Examples (New Format)

Multiple examples are separated by `||` (double pipe). Each example uses `::` (double colon) to separate fields:

**Format:** `japanese::reading::meaning||japanese::reading::meaning`

**Example:**
```
example: 日本語::にほんご::Japanese language||日本語を話す::にほんごをはなす::speak Japanese
```

**Note:** Reading is optional. You can use:
- `japanese::meaning` (no reading)
- `japanese::reading::meaning` (with reading)

### Examples (Old Format - Still Supported)

For backward compatibility, you can still use separate columns:
- `example_japanese` - Japanese text
- `example_reading` - Reading (optional)
- `example_meaning` - Meaning

## Import Commands

### Import All Classes

To import all CSV files at once:

```bash
cd backend
source ../venv/bin/activate
python manage.py import_kanji_csv --all
```

### Import Specific Class

To import kanji for a specific class (e.g., class 1):

```bash
python manage.py import_kanji_csv --class 1
```

