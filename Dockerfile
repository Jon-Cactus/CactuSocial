FROM python:3.12-slim

# Reduce container size and performance
ENV PYTHONDONTWRITEBYCODE 1
# Help with debugging by printing logs immediately
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# For Gunicorn purposes
EXPOSE 8000

ARG DJANGO_SECRET_KEY=build-secret-key

RUN SECRET_KEY=$DJANGO_SECRET_KEY python manage.py collectstatic --noinput

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "cactusocial.wsgi:application"]