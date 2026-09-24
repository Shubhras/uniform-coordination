FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    default-mysql-client \
    pkg-config \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libffi8 \
    shared-mime-info \
    fonts-liberation \
 && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and group
RUN groupadd -g 1000 appuser && useradd -u 1000 -g appuser -d /app -s /bin/bash appuser

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8005

CMD ["gunicorn", "UniformWeb.wsgi:application", "--bind", "0.0.0.0:8005", "--workers", "3", "--timeout", "120"]