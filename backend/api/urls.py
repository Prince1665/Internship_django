from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/signup/', views.SignupView.as_view(), name='signup'),

    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document-list'),
    path('documents/<uuid:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<uuid:pk>/download/', views.DocumentDownloadView.as_view(), name='document-download'),

    # Modification requests
    path('requests/', views.ModificationRequestListView.as_view(), name='mod-request-list'),
    path('requests/<uuid:pk>/', views.ModificationRequestDetailView.as_view(), name='mod-request-detail'),

    # Read access requests
    path('read-requests/', views.ReadAccessRequestListView.as_view(), name='read-request-list'),
    path('read-requests/<uuid:pk>/', views.ReadAccessRequestDetailView.as_view(), name='read-request-detail'),
]
