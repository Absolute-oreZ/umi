FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY recommendation/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY recommendation/ .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5002

CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "4", "app:app"]