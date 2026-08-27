FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 4004

CMD ["gunicorn", "reporting.wsgi:application", "--bind", "0.0.0.0:4004"]
