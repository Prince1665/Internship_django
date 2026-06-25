from rest_framework import serializers
from .models import Document, ModificationRequest, ReadAccessRequest, User


class DocumentSerializer(serializers.ModelSerializer):
    accountName = serializers.CharField(source='account_name')
    uploadedBy = serializers.SerializerMethodField()
    fileName = serializers.CharField(source='file_name', allow_null=True, required=False)
    mimeType = serializers.CharField(source='mime_type', allow_null=True, required=False)

    class Meta:
        model = Document
        fields = ['id', 'accountName', 'specifier', 'sku', 'date', 'status',
                  'icon', 'fileName', 'mimeType', 'uploadedBy', 'notes']

    def get_uploadedBy(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None


class ModificationRequestSerializer(serializers.ModelSerializer):
    documentId = serializers.UUIDField(source='document_id')
    requestDetails = serializers.CharField(source='request_details')

    class Meta:
        model = ModificationRequest
        fields = ['id', 'documentId', 'date', 'employee', 'account', 'requestDetails', 'status']


class ReadAccessRequestSerializer(serializers.ModelSerializer):
    documentId = serializers.UUIDField(source='document_id')
    requestedBy = serializers.SerializerMethodField()
    requestedAt = serializers.DateTimeField(source='requested_at')

    class Meta:
        model = ReadAccessRequest
        fields = ['id', 'documentId', 'requestedBy', 'requestedAt', 'status']

    def get_requestedBy(self, obj):
        return obj.requested_by.email if obj.requested_by else None
