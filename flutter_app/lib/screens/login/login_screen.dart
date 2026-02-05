import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/loading_screen.dart';
import '../../widgets/common/animated_list_item.dart';
import '../../widgets/common/animated_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isSignUp = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLogin() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      if (_isSignUp) {
        await ref.read(authProvider.notifier).signUpWithEmail(
              _emailController.text.trim(),
              _passwordController.text,
              'User', // Default name, can be enhanced
            );
        // New signups go to onboarding
        if (mounted) {
          await Future.delayed(const Duration(milliseconds: 300));
          context.go('/onboarding');
        }
      } else {
        await ref.read(authProvider.notifier).loginWithEmail(
              _emailController.text.trim(),
              _passwordController.text,
            );
        // Existing users go to dashboard
        if (mounted) {
          await Future.delayed(const Duration(milliseconds: 300));
          context.go('/dashboard');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _handleGoogleLogin() async {
    try {
      await ref.read(authProvider.notifier).loginWithGoogle();
      if (mounted) {
        // Wait a moment for state to update, then navigate
        await Future.delayed(const Duration(milliseconds: 300));
        final authState = ref.read(authProvider);
        if (authState.isAuthenticated && mounted) {
          // Check if user is new (first time login) - redirect to onboarding
          final user = authState.user;
          final isNewUser = user?.createdAt != null && 
              DateTime.now().difference(user!.createdAt).inSeconds < 10;
          context.go(isNewUser ? '/onboarding' : '/dashboard');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _handleAppleLogin() async {
    try {
      await ref.read(authProvider.notifier).loginWithApple();
      if (mounted) {
        // Wait a moment for state to update, then navigate
        await Future.delayed(const Duration(milliseconds: 300));
        final authState = ref.read(authProvider);
        if (authState.isAuthenticated && mounted) {
          final user = authState.user;
          final isNewUser = user?.createdAt != null && 
              DateTime.now().difference(user!.createdAt).inSeconds < 10;
          context.go(isNewUser ? '/onboarding' : '/dashboard');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  void _handleGuestLogin() {
    ref.read(authProvider.notifier).continueAsGuest();
    context.go('/dashboard');
  }

  void _handleDemoLogin() {
    ref.read(authProvider.notifier).skipToDemo();
    context.go('/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    if (authState.isLoading) {
      return const LoadingScreen(message: 'Signing in...');
    }

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                // Logo/Title - Scale fade in
                const ScaleFadeInWidget(
                  delay: Duration(milliseconds: 0),
                  duration: Duration(milliseconds: 500),
                  beginScale: 0.8,
                  child: Text(
                    'AI Tutor',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 8),
                // Subtitle - Fade in
                FadeInWidget(
                  delay: const Duration(milliseconds: 100),
                  duration: const Duration(milliseconds: 400),
                  child: Text(
                    'Your Intelligent Learning Companion',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.grey[600],
                        ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 48),

                // Email Field - Slide fade in
                SlideFadeInWidget(
                  delay: const Duration(milliseconds: 200),
                  slideOffset: const Offset(-0.1, 0.0),
                  child: TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // Password Field - Slide fade in
                SlideFadeInWidget(
                  delay: const Duration(milliseconds: 300),
                  slideOffset: const Offset(-0.1, 0.0),
                  child: TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility : Icons.visibility_off,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 24),

                // Login/Sign Up Button - Slide fade in with animated button
                SlideFadeInWidget(
                  delay: const Duration(milliseconds: 400),
                  slideOffset: const Offset(0.0, 0.1),
                  child: AnimatedElevatedButton(
                    onPressed: _handleEmailLogin,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(_isSignUp ? 'Sign Up' : 'Login'),
                  ),
                ),
                const SizedBox(height: 8),

                // Toggle Sign Up/Login
                FadeInWidget(
                  delay: const Duration(milliseconds: 450),
                  child: TextButton(
                    onPressed: () {
                      setState(() {
                        _isSignUp = !_isSignUp;
                      });
                    },
                    child: Text(
                      _isSignUp
                          ? 'Already have an account? Login'
                          : 'Don\'t have an account? Sign Up',
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Divider
                FadeInWidget(
                  delay: const Duration(milliseconds: 500),
                  child: Row(
                    children: [
                      Expanded(child: Divider(color: Colors.grey[300])),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.grey[300])),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Google Sign In
                SlideFadeInWidget(
                  delay: const Duration(milliseconds: 550),
                  slideOffset: const Offset(0.1, 0.0),
                  child: AnimatedOutlinedButton(
                    onPressed: _handleGoogleLogin,
                    icon: const Icon(Icons.g_mobiledata, size: 24),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Continue with Google'),
                  ),
                ),
                const SizedBox(height: 12),

                // Apple Sign In (iOS/macOS only)
                if (Theme.of(context).platform == TargetPlatform.iOS ||
                    Theme.of(context).platform == TargetPlatform.macOS)
                  SlideFadeInWidget(
                    delay: const Duration(milliseconds: 600),
                    slideOffset: const Offset(0.1, 0.0),
                    child: AnimatedOutlinedButton(
                      onPressed: _handleAppleLogin,
                      icon: const Icon(Icons.apple, size: 24),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Continue with Apple'),
                    ),
                  ),
                if (Theme.of(context).platform == TargetPlatform.iOS ||
                    Theme.of(context).platform == TargetPlatform.macOS)
                  const SizedBox(height: 12),

                // Guest Mode
                FadeInWidget(
                  delay: const Duration(milliseconds: 650),
                  child: TextButton(
                    onPressed: _handleGuestLogin,
                    child: const Text('Continue as Guest'),
                  ),
                ),
                const SizedBox(height: 8),

                // Demo Mode
                FadeInWidget(
                  delay: const Duration(milliseconds: 700),
                  child: TextButton(
                    onPressed: _handleDemoLogin,
                    child: const Text('Try Demo Mode'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
