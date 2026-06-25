import re
import uuid
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Document, ModificationRequest, ReadAccessRequest, User
from .serializers import (
    DocumentSerializer, ModificationRequestSerializer, ReadAccessRequestSerializer
)


# ────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────

def slugify(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'file'


def infer_icon(filename: str) -> str:
    n = filename.lower()
    if n.endswith(('.xlsx', '.xls', '.xlsm')):
        return 'spreadsheet'
    if n.endswith(('.pptx', '.ppt')):
        return 'presentation'
    if n.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp')):
        return 'image'
    if n.endswith('.csv'):
        return 'csv'
    return 'file'


def get_supabase():
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# ────────────────────────────────────────────────────────────────
# Auth
# ────────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password') or ''
        role = (request.data.get('role') or '').strip().upper()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role.upper() != role:
            return Response({'error': 'Role mismatch'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'email': user.email,
            'id': str(user.id),
        })


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password') or ''
        role = (request.data.get('role') or 'SALES').strip().upper()

        if role not in ('SALES', 'KAM', 'ADMIN'):
            return Response({'error': 'Self-signup is only allowed for SALES, KAM, or ADMIN roles.'}, status=400)

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'An account with this email already exists.'}, status=400)

        user = User.objects.create_user(email=email, password=password, role=role)
        return Response({'id': str(user.id), 'email': user.email, 'role': user.role}, status=201)


# ────────────────────────────────────────────────────────────────
# Documents
# ────────────────────────────────────────────────────────────────

class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        docs = Document.objects.all()
        return Response(DocumentSerializer(docs, many=True).data)

    def post(self, request):
        file = request.FILES.get('file')
        account_name = (request.data.get('accountName') or '').strip()
        specifier = (request.data.get('specifier') or '').strip()
        sku = (request.data.get('sku') or '').strip()
        notes = (request.data.get('notes') or '').strip() or None

        if not file:
            return Response({'error': 'No file provided.'}, status=400)
        if not account_name or not specifier or not sku:
            return Response({'error': 'accountName, specifier and sku are required.'}, status=400)

        ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else 'bin'
        file_name = f"{slugify(account_name)}-{slugify(specifier)}-{uuid.uuid4().hex[:8]}.{ext}"

        try:
            sb = get_supabase()
            sb.storage.from_(settings.SUPABASE_BUCKET).upload(
                file_name,
                file.read(),
                {'content-type': file.content_type or 'application/octet-stream'},
            )
        except Exception as e:
            return Response({'error': f'File upload failed: {e}'}, status=500)

        doc = Document.objects.create(
            account_name=account_name,
            specifier=specifier,
            sku=sku,
            status='Active',
            icon=infer_icon(file.name),
            file_name=file_name,
            mime_type=file.content_type,
            uploaded_by=request.user,
            notes=notes,
        )
        return Response(DocumentSerializer(doc).data, status=201)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=404)

        field_map = {
            'accountName': 'account_name',
            'specifier': 'specifier',
            'sku': 'sku',
            'status': 'status',
            'notes': 'notes',
        }
        for camel, db_field in field_map.items():
            if camel in request.data:
                setattr(doc, db_field, request.data[camel])
        doc.save()
        return Response(DocumentSerializer(doc).data)


class DocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=404)

        if not doc.file_name:
            return Response({'error': 'No file attached to this document.'}, status=404)

        try:
            sb = get_supabase()
            result = sb.storage.from_(settings.SUPABASE_BUCKET).create_signed_url(doc.file_name, 120)
            return Response({'url': result['signedURL']})
        except Exception as e:
            return Response({'error': f'Could not generate download URL: {e}'}, status=500)


# ────────────────────────────────────────────────────────────────
# Modification Requests
# ────────────────────────────────────────────────────────────────

class ModificationRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reqs = ModificationRequest.objects.all()
        return Response(ModificationRequestSerializer(reqs, many=True).data)

    def post(self, request):
        doc_id = request.data.get('documentId')
        employee = (request.data.get('employee') or '').strip()
        account = (request.data.get('account') or '').strip()
        request_details = (request.data.get('requestDetails') or '').strip()

        if not doc_id or not employee:
            return Response({'error': 'documentId and employee are required.'}, status=400)

        try:
            doc = Document.objects.get(pk=doc_id)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=404)

        # Prevent duplicate requests from same employee on same doc
        if ModificationRequest.objects.filter(document=doc, employee=employee).exists():
            return Response({'error': 'You have already requested an edit for this document.'}, status=400)

        req = ModificationRequest.objects.create(
            document=doc,
            employee=employee,
            account=account,
            request_details=request_details,
            status='Pending',
        )
        return Response(ModificationRequestSerializer(req).data, status=201)


class ModificationRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            req = ModificationRequest.objects.get(pk=pk)
        except ModificationRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=404)

        if 'status' in request.data:
            req.status = request.data['status']
            req.save()
        return Response(ModificationRequestSerializer(req).data)


# ────────────────────────────────────────────────────────────────
# Read Access Requests
# ────────────────────────────────────────────────────────────────

class ReadAccessRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reqs = ReadAccessRequest.objects.all()
        return Response(ReadAccessRequestSerializer(reqs, many=True).data)

    def post(self, request):
        doc_id = request.data.get('documentId')
        if not doc_id:
            return Response({'error': 'documentId is required.'}, status=400)

        try:
            doc = Document.objects.get(pk=doc_id)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=404)

        req = ReadAccessRequest.objects.create(
            document=doc,
            requested_by=request.user,
            status='pending',
        )
        return Response(ReadAccessRequestSerializer(req).data, status=201)


class ReadAccessRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            req = ReadAccessRequest.objects.get(pk=pk)
        except ReadAccessRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=404)

        if 'status' in request.data:
            req.status = request.data['status']
            req.save()
        return Response(ReadAccessRequestSerializer(req).data)

    def delete(self, request, pk):
        try:
            req = ReadAccessRequest.objects.get(pk=pk)
        except ReadAccessRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=404)
        req.delete()
        return Response({'success': True}, status=204)
