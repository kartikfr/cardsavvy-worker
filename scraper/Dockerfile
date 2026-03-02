# Use the official Playwright Python image which includes all browser dependencies
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download Chromium specifically (even though base image has it, good to ensure binaries match Python wrapper)
RUN playwright install chromium

# Copy the rest of the application
COPY . .

# Expose port (Render uses $PORT environment variable, default to 8000)
EXPOSE 8000

# Run Uvicorn server
# We use host 0.0.0.0 so Render's internal routing can hit it
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
