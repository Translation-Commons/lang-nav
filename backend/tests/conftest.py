import sys
from pathlib import Path

# Make the etl package importable when pytest is run from backend/ or from the
# repository root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
