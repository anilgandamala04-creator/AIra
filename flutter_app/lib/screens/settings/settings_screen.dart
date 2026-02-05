import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/common/animated_list_item.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _notifications = true;
  bool _soundEffects = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const FadeInWidget(
          delay: Duration(milliseconds: 100),
          child: Text('Settings'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 100),
              child: Text(
                'Appearance',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 0,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildToggleSetting(
                context,
                icon: Icons.dark_mode,
                title: 'Dark Mode',
                subtitle: 'Enable dark theme',
                value: _darkMode,
                onChanged: (value) => setState(() => _darkMode = value),
              ),
            ),
            const SizedBox(height: 24),

            // Notifications section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 200),
              child: Text(
                'Notifications',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 1,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildToggleSetting(
                context,
                icon: Icons.notifications,
                title: 'Push Notifications',
                subtitle: 'Receive learning reminders',
                value: _notifications,
                onChanged: (value) => setState(() => _notifications = value),
              ),
            ),
            AnimatedListItem(
              index: 2,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildToggleSetting(
                context,
                icon: Icons.volume_up,
                title: 'Sound Effects',
                subtitle: 'Play sounds for achievements',
                value: _soundEffects,
                onChanged: (value) => setState(() => _soundEffects = value),
              ),
            ),
            const SizedBox(height: 24),

            // General section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 300),
              child: Text(
                'General',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 3,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildNavigationSetting(
                context,
                icon: Icons.language,
                title: 'Language',
                value: 'English',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 4,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildNavigationSetting(
                context,
                icon: Icons.info,
                title: 'About',
                value: 'v1.0.0',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 5,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildNavigationSetting(
                context,
                icon: Icons.description,
                title: 'Terms of Service',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 6,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildNavigationSetting(
                context,
                icon: Icons.privacy_tip,
                title: 'Privacy Policy',
                onTap: () {},
              ),
            ),
            const SizedBox(height: 24),

            // Logout button
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 500),
              slideOffset: const Offset(0, 0.1),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => context.go('/login'),
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text(
                    'Sign Out',
                    style: TextStyle(color: Colors.red),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleSetting(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AnimatedCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: Theme.of(context).primaryColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: value,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavigationSetting(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? value,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AnimatedCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: Theme.of(context).primaryColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            if (value != null)
              Text(
                value,
                style: TextStyle(color: Colors.grey[600]),
              ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
