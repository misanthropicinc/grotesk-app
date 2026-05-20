FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/media/pfps /app/media/logos /app/media/items /app/media/runway /app/media/shoe_models

EXPOSE 8000

CMD ["gunicorn", "grotesk_api.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
