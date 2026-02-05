import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final bool isGuest;
  final String? error;

  AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isGuest = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isAuthenticated,
    bool? isLoading,
    bool? isGuest,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isGuest: isGuest ?? this.isGuest,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  StreamSubscription<User?>? _authStateSubscription;

  AuthNotifier(this._authService) : super(AuthState()) {
    _initAuthListener();
  }

  void _initAuthListener() {
    // Set initial loading state
    state = state.copyWith(isLoading: true);
    
    // Listen to auth state changes in real-time
    _authStateSubscription = _authService.authStateChanges.listen(
      (user) {
        if (user != null) {
          state = state.copyWith(
            user: user,
            isAuthenticated: true,
            isLoading: false,
            isGuest: false,
            error: null,
          );
        } else {
          // Only clear if not a guest user
          if (!state.isGuest) {
            state = state.copyWith(
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            );
          }
        }
      },
      onError: (error) {
        state = state.copyWith(
          isLoading: false,
          error: error.toString(),
        );
      },
    );
  }

  @override
  void dispose() {
    _authStateSubscription?.cancel();
    super.dispose();
  }

  Future<void> loginWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.loginWithEmail(email, password);
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> signUpWithEmail(String email, String password, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.signUpWithEmail(email, password, name);
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.loginWithGoogle();
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> loginWithApple() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.loginWithApple();
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  void continueAsGuest() {
    final guestUser = User.createGuest();
    state = state.copyWith(
      user: guestUser,
      isAuthenticated: true,
      isLoading: false,
      isGuest: true,
    );
  }

  void skipToDemo() {
    final demoUser = User.createDemo();
    state = state.copyWith(
      user: demoUser,
      isAuthenticated: true,
      isLoading: false,
      isGuest: false,
    );
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.logout();
      state = AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> recoverPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _authService.recoverPassword(email);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
}
