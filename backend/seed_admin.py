"""
Run once to create the admin user:
  python seed_admin.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

email = input("Admin email: ").strip().lower()
password = input("Admin password: ").strip()

if User.objects.filter(email=email).exists():
    print(f"User {email} already exists.")
else:
    User.objects.create_user(email=email, password=password, role='ADMIN')
    print(f"Admin user {email} created successfully.")
