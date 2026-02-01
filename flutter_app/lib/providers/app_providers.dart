import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Theme Mode Provider
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.system) {
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    // Load from shared preferences
    // For now, default to system
    state = ThemeMode.system;
  }

  void setThemeMode(ThemeMode mode) {
    state = mode;
    // Save to shared preferences
  }

  void toggleTheme() {
    state = state == ThemeMode.light 
        ? ThemeMode.dark 
        : ThemeMode.light;
  }
}
