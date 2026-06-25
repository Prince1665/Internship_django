"""
Creates dummy users for all three roles.

Run from inside the backend/ directory:
    python seed_users.py

Edit the USERS list below to change emails or passwords.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

USERS = [
    {"email": "admin@demo.com",  "password": "Admin@1234",  "role": "ADMIN"},
    {"email": "kam@demo.com",    "password": "Kam@1234",    "role": "KAM"},
    {"email": "sales@demo.com",  "password": "Sales@1234",  "role": "SALES"},
]

print("\n── Seeding demo users ──────────────────────────")
for u in USERS:
    if User.objects.filter(email=u["email"]).exists():
        print(f"  SKIP  {u['role']:<6}  {u['email']}  (already exists)")
    else:
        User.objects.create_user(
            email=u["email"],
            password=u["password"],
            role=u["role"],
        )
        print(f"  OK    {u['role']:<6}  {u['email']}  /  {u['password']}")

print("────────────────────────────────────────────────\n")
