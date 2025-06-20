FROM python:3.12-slim-bookworm

WORKDIR /app

# Install system dependencies and security updates
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* 

# Install uv
RUN pip install --no-cache-dir uv

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN uv pip install --no-cache --system -r requirements.txt

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
