import 'package:flutter/material.dart';
import '../../widgets/common/animated_list_item.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const FadeInWidget(
          delay: Duration(milliseconds: 100),
          child: Text('Profile'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile header
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 100),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Avatar with scale animation
                      ScaleFadeInWidget(
                        delay: const Duration(milliseconds: 150),
                        beginScale: 0.5,
                        child: CircleAvatar(
                          radius: 50,
                          backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                          child: Icon(
                            Icons.person,
                            size: 50,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      FadeInWidget(
                        delay: const Duration(milliseconds: 250),
                        child: Text(
                          'Guest User',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      FadeInWidget(
                        delay: const Duration(milliseconds: 300),
                        child: Text(
                          'Learning enthusiast',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Stats section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 300),
              child: Text(
                'Learning Stats',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: AnimatedListItem(
                    index: 0,
                    staggerDelay: const Duration(milliseconds: 100),
                    child: _buildStatCard(context, '0', 'Courses', Icons.book),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AnimatedListItem(
                    index: 1,
                    staggerDelay: const Duration(milliseconds: 100),
                    child: _buildStatCard(context, '0h', 'Learning', Icons.timer),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AnimatedListItem(
                    index: 2,
                    staggerDelay: const Duration(milliseconds: 100),
                    child: _buildStatCard(context, '0', 'Streak', Icons.local_fire_department),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Menu items
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 500),
              child: Text(
                'Account',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 0,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildMenuItem(
                context,
                icon: Icons.edit,
                title: 'Edit Profile',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 1,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildMenuItem(
                context,
                icon: Icons.notifications,
                title: 'Notifications',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 2,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildMenuItem(
                context,
                icon: Icons.security,
                title: 'Privacy & Security',
                onTap: () {},
              ),
            ),
            AnimatedListItem(
              index: 3,
              staggerDelay: const Duration(milliseconds: 80),
              child: _buildMenuItem(
                context,
                icon: Icons.help,
                title: 'Help & Support',
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String value, String label, IconData icon) {
    return AnimatedCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(
            icon,
            color: Theme.of(context).primaryColor,
            size: 24,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AnimatedCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.grey[600]),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
