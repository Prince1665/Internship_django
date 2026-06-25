import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password, role='SALES'):
        if not email:
            raise ValueError('Email is required')
        user = self.model(email=self.normalize_email(email), role=role.upper())
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, role='ADMIN'):
        return self.create_user(email, password, role)


class User(AbstractBaseUser):
    ROLE_CHOICES = [('ADMIN', 'Admin'), ('SALES', 'Sales'), ('KAM', 'KAM')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='SALES')
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Document(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Under Review', 'Under Review'),
        ('Revised', 'Revised'),
    ]
    ICON_CHOICES = [
        ('file', 'file'), ('spreadsheet', 'spreadsheet'),
        ('presentation', 'presentation'), ('image', 'image'), ('csv', 'csv'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account_name = models.CharField(max_length=255)
    specifier = models.CharField(max_length=255)
    sku = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='file')
    file_name = models.CharField(max_length=500, blank=True, null=True)
    mime_type = models.CharField(max_length=255, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='documents')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-date']

    def __str__(self):
        return f"{self.account_name} – {self.specifier}"


class ModificationRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'), ('Approved', 'Approved'),
        ('Rejected', 'Rejected'), ('Processed', 'Processed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='modification_requests')
    date = models.DateField(auto_now_add=True)
    employee = models.CharField(max_length=255)
    account = models.CharField(max_length=255)
    request_details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    class Meta:
        db_table = 'modification_requests'
        ordering = ['-date']

    def __str__(self):
        return f"ModReq {self.id} – {self.status}"


class ReadAccessRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'pending'), ('approved', 'approved'), ('rejected', 'rejected'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='read_requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='read_requests')
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        db_table = 'read_access_requests'
        ordering = ['-requested_at']

    def __str__(self):
        return f"ReadReq {self.id} – {self.status}"
