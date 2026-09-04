from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, UserCreateSerializer, UserUpdateSerializer
from django.db.models import Q
from cases.permissions import IsAdminOrHead

User = get_user_model()


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for authentication endpoints: login, refresh, logout, register.
    Uses JWT tokens via djangorestframework-simplejwt.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Login endpoint using JWT authentication.
        Returns access and refresh tokens along with user data.
        """
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Login attempt with data: {request.data}")
        
        # Get the standard JWT response
        token_view = TokenObtainPairView.as_view()
        token_response = token_view(request._request)
        
        logger.info(f"Token response status: {token_response.status_code}")
        logger.info(f"Token response data: {token_response.data if hasattr(token_response, 'data') else token_response.content}")
        
        if token_response.status_code == 200:
            # Get the user from the validated credentials
            from django.contrib.auth import authenticate
            username = request.data.get('username')
            password = request.data.get('password')
            user = authenticate(username=username, password=password)
            
            logger.info(f"Authenticated user: {user}")
            
            if user:
                serializer = UserSerializer(user)
                token_response.data['user'] = serializer.data
        
        return token_response

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def refresh(self, request):
        """
        Refresh endpoint to get new access token using refresh token.
        """
        return TokenRefreshView.as_view()(request._request)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout endpoint - client should discard tokens.
        In JWT, logout is handled client-side by token deletion.
        """
        return Response(
            {"message": "Successfully logged out"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Registration endpoint for new users.
        Creates a new user account with role-based access.
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user information.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def legal_officers(self, request):
        """
        Get list of legal officers for assignment dropdowns.
        """
        officers = User.objects.filter(role='legal_officer').values('id', 'first_name', 'last_name', 'username')
        return Response(list(officers))


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management (admin only).
    Provides CRUD operations with deactivate instead of delete.
    """
    permission_classes = [IsAdminOrHead]
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
        return queryset

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def deactivate(self, request, pk=None):
        """
        Deactivate a user instead of deleting.
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': f'User {user.username} has been deactivated'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def activate(self, request, pk=None):
        """
        Reactivate a deactivated user.
        """
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': f'User {user.username} has been activated'})
