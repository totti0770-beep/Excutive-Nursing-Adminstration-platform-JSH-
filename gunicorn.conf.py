"""Gunicorn configuration.

Sensible production defaults; override via environment variables.
"""

import multiprocessing
import os

bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:8000")
# 2*CPU + 1 is the usual starting point for sync workers.
workers = int(os.environ.get("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "60"))
# Log to stdout/stderr so a container platform can collect them.
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info").lower()
