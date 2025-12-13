import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

username = 'admin'
email = 'admin@church.com'
password = 'admin123'  # Change this in production!

if User.objects.filter(username=username).exists():
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_active = True
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f'User {username} already exists. Password has been reset.')
    print(f'Username: {username}')
    print(f'Password: {password}')
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser {username} created successfully!')
    print(f'Username: {username}')
    print(f'Password: {password}')

