"""Production WSGI entrypoint.

Served by gunicorn, e.g.:  gunicorn --bind 0.0.0.0:8000 wsgi:app
"""

from app import create_app

app = create_app()
