import 'package:firebase_analytics/firebase_analytics.dart';

class FirebaseService {
  static FirebaseAnalytics? _analytics;

  static Future<void> initialize() async {
    // Firebase is already initialized in main.dart
    _analytics = FirebaseAnalytics.instance;
  }

  static FirebaseAnalytics get analytics {
    if (_analytics == null) {
      throw Exception('Firebase Analytics not initialized. Call initialize() first.');
    }
    return _analytics!;
  }

  static Future<void> logEvent(String name, Map<String, dynamic>? parameters) async {
    await _analytics?.logEvent(
      name: name,
      parameters: parameters,
    );
  }
}
