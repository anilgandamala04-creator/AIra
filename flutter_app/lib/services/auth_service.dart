import 'package:supabase_flutter/supabase_flutter.dart' as supabase;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../models/user_model.dart';

class AuthService {
  final supabase.SupabaseClient _client = supabase.Supabase.instance.client;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? _userFromSupabase(supabase.User? supabaseUser) {
    if (supabaseUser == null) return null;
    
    final metadata = supabaseUser.userMetadata ?? {};
    final name = metadata['full_name'] ?? metadata['name'] ?? supabaseUser.email ?? 'User';
    
    return User(
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: name,
      displayName: name,
      avatar: metadata['avatar_url'],
      authMethod: _getAuthMethod(supabaseUser),
      isVerified: supabaseUser.emailConfirmedAt != null,
      createdAt: DateTime.parse(supabaseUser.createdAt),
    );
  }

  AuthMethod _getAuthMethod(supabase.User user) {
    final provider = user.appMetadata['provider'] as String?;
    if (provider == 'google') {
      return AuthMethod.google;
    } else if (provider == 'apple') {
      return AuthMethod.apple;
    }
    return AuthMethod.email;
  }

  Future<User?> getCurrentUser() async {
    final supabaseUser = _client.auth.currentUser;
    return _userFromSupabase(supabaseUser);
  }

  Stream<User?> get authStateChanges {
    return _client.auth.onAuthStateChange.map((event) => _userFromSupabase(event.session?.user));
  }

  Future<User> loginWithEmail(String email, String password) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      final user = _userFromSupabase(response.user);
      if (user == null) {
        throw Exception('Failed to create user object');
      }
      return user;
    } on supabase.AuthException catch (e) {
      throw e.message;
    }
  }

  Future<User> signUpWithEmail(String email, String password, String name) async {
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': name},
      );
      
      final user = _userFromSupabase(response.user);
      if (user == null) {
        throw Exception('Failed to create user object');
      }
      return user;
    } on supabase.AuthException catch (e) {
      throw e.message;
    }
  }

  Future<User> loginWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google sign in was cancelled');
      }

      final googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.accessToken;
      final idToken = googleAuth.idToken;

      if (accessToken == null || idToken == null) {
        throw Exception('Failed to get Google authentication tokens');
      }

      final response = await _client.auth.signInWithIdToken(
        provider: supabase.OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      final user = _userFromSupabase(response.user);
      if (user == null) {
        throw Exception('Failed to create user object');
      }
      return user;
    } on supabase.AuthException catch (e) {
      throw e.message;
    } catch (e) {
      throw Exception('Google sign in failed: ${e.toString()}');
    }
  }

  Future<User> loginWithApple() async {
    try {
      final isAvailable = await SignInWithApple.isAvailable();
      if (!isAvailable) {
        throw Exception('Apple Sign In is not available on this device');
      }

      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final response = await _client.auth.signInWithIdToken(
        provider: supabase.OAuthProvider.apple,
        idToken: appleCredential.identityToken!,
      );
      
      final user = _userFromSupabase(response.user);
      if (user == null) {
        throw Exception('Failed to create user object');
      }
      return user;
    } on supabase.AuthException catch (e) {
      throw e.message;
    } catch (e) {
      throw Exception('Apple sign in failed: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    await _googleSignIn.signOut();
    await _client.auth.signOut();
  }

  Future<void> recoverPassword(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(email);
    } on supabase.AuthException catch (e) {
      throw e.message;
    }
  }
}

// Alias for User to avoid breaking changes if some files still use FirebaseUser
typedef FirebaseUser = User;
