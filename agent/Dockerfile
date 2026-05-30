FROM python:3.11-slim

# Create non-root user for security compliance
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Leverage Docker layer caching for pip dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Set correct non-root permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
