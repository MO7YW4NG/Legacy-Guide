FROM python:3.12-slim-bookworm

WORKDIR /app

# Install system dependencies and security updates
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser \
    && chown -R appuser:appuser /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy requirements first to leverage Docker cache
COPY --chown=appuser:appuser requirements.txt .
RUN uv pip install --no-cache -r requirements.txt

# Copy the rest of the application
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
