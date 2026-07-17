FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for packages like psycopg2-binary, numpy, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Expose default port
EXPOSE 8000

# Run FastAPI app using uvicorn. Note that Render/Koyeb will inject PORT env var,
# so we run it on port 8000 or the dynamically injected PORT.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
