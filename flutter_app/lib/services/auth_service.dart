import 'dart:async';
import '../models/user_model.dart';

/// Auth service — no Supabase or Firebase. App uses local/guest or role-based entry only.
class AuthService {
  User? _currentUser;
  final _authStateController = StreamController<User?>.broadcast();

  Future<User?> getCurrentUser() async {
    return _currentUser;
  }

  Stream<User?> get authStateChanges {
    return _authStateController.stream;
  }

  Future<User> loginWithEmail(String email, String password) async {
    // For demo/audit purposes, any non-empty login works
    if (email.isEmpty || password.isEmpty) {
      throw Exception('Email and password are required');
    }
    final user = User.createDemo().copyWith(email: email, name: email.split('@')[0]);
    _currentUser = user;
    _authStateController.add(user);
    return user;
  }

  Future<User> signUpWithEmail(String email, String password, String name) async {
    if (email.isEmpty || password.isEmpty || name.isEmpty) {
      throw Exception('All fields are required');
    }
    final user = User(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      name: name,
      authMethod: AuthMethod.email,
      createdAt: DateTime.now(),
    );
    _currentUser = user;
    _authStateController.add(user);
    return user;
  }

  Future<User> loginWithGoogle() async {
    final user = User.createDemo().copyWith(
      id: 'google_${DateTime.now().millisecondsSinceEpoch}',
      name: 'Google User',
      authMethod: AuthMethod.google,
    );
    _currentUser = user;
    _authStateController.add(user);
    return user;
  }

  Future<User> loginWithApple() async {
    final user = User.createDemo().copyWith(
      id: 'apple_${DateTime.now().millisecondsSinceEpoch}',
      name: 'Apple User',
      authMethod: AuthMethod.apple,
    );
    _currentUser = user;
    _authStateController.add(user);
    return user;
  }

  Future<void> logout() async {
    _currentUser = null;
    _authStateController.add(null);
  }

  Future<void> recoverPassword(String email) async {
    // No-op for demo
    if (email.isEmpty) throw Exception('Email is required');
  }

  /// Set current user for guest/demo flow (no external auth).
  void setGuestUser(User user) {
    _currentUser = user;
    _authStateController.add(user);
  }
}
