# Nursing Executive Administration System — production image.
# The Tailwind CSS is prebuilt and committed (app/static/css/tailwind.css),
# so no Node toolchain is needed at build or run time.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_APP=wsgi.py \
    FLASK_ENV=production

WORKDIR /app

# Install Python dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application.
COPY . .

# Run as a non-root user.
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Apply migrations, then serve. DATABASE_URL and SECRET_KEY come from the
# environment at runtime.
CMD ["sh", "-c", "flask db upgrade && gunicorn -c gunicorn.conf.py wsgi:app"]
