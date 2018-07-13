# app/__init__.py

from flask import Flask

# Initialize the app
app = Flask(__name__)
#app.config.from_object(Config)

# Load the views
from app import views
try:
    from app.confluence import ojcctm_views
    from app.confluence import thisiscvah_views
except ImportError as e:
    print("ERROR: Failed to import expected controllers for confluence documentation. "
          "To bypass this error, please run the confluence scrapper tool.")