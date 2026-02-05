import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../screens/login/login_screen.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/teaching/teaching_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../providers/auth_provider.dart';
import '../utils/page_transitions.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isOnLoginPage = state.matchedLocation == '/login';
      
      // Redirect to login if not authenticated
      if (!isAuthenticated && !isOnLoginPage) {
        return '/login';
      }
      
      // Redirect to dashboard if authenticated and on login page
      if (isAuthenticated && isOnLoginPage) {
        return '/dashboard';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        pageBuilder: (context, state) => const LoginScreen().toFadePage(
          key: const ValueKey('login'),
        ),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        pageBuilder: (context, state) => const OnboardingScreen().toFadeSlidePage(
          key: const ValueKey('onboarding'),
          direction: SlideDirection.up,
        ),
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        pageBuilder: (context, state) => const DashboardScreen().toFadeSlidePage(
          key: const ValueKey('dashboard'),
          direction: SlideDirection.up,
        ),
      ),
      GoRoute(
        path: '/learn/:topicId',
        name: 'teaching',
        pageBuilder: (context, state) {
          final topicId = state.pathParameters['topicId'] ?? '';
          return TeachingScreen(topicId: topicId).toSlidePage(
            key: ValueKey('teaching-$topicId'),
            direction: SlideDirection.left,
          );
        },
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        pageBuilder: (context, state) => const ProfileScreen().toSlidePage(
          key: const ValueKey('profile'),
          direction: SlideDirection.left,
        ),
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        pageBuilder: (context, state) => const SettingsScreen().toSlidePage(
          key: const ValueKey('settings'),
          direction: SlideDirection.left,
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Page not found: ${state.uri}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/dashboard'),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
});
