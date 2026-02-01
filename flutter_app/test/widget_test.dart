// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:ai_tutor/main.dart';

void main() {
  testWidgets('App loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      EasyLocalization(
        supportedLocales: const [Locale('en', 'US')],
        path: 'assets/localization',
        fallbackLocale: const Locale('en', 'US'),
        child: const ProviderScope(
          child: AiTutorApp(),
        ),
      ),
    );

    // Verify that the app loads (check for login screen or any initial screen)
    await tester.pumpAndSettle();
    
    // The app should render without errors
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
