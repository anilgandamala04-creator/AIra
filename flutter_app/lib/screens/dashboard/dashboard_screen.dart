import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/common/animated_list_item.dart';
import '../../widgets/common/profile_overlay.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const FadeInWidget(
          delay: Duration(milliseconds: 100),
          child: Text('Dashboard'),
        ),
        actions: [
          FadeInWidget(
            delay: const Duration(milliseconds: 200),
            child: IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () => context.push('/settings'),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 100),
              slideOffset: const Offset(0, 0.1),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome back!',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Continue your learning journey',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Quick actions
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 200),
              child: Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            // Action cards with staggered animation
            AnimatedListItem(
              index: 0,
              staggerDelay: const Duration(milliseconds: 100),
              child: _buildActionCard(
                context,
                icon: Icons.school,
                title: 'Start Learning',
                subtitle: 'Continue where you left off',
                onTap: () => context.push('/learn/intro'),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 1,
              staggerDelay: const Duration(milliseconds: 100),
              child: _buildActionCard(
                context,
                icon: Icons.person,
                title: 'Profile',
                subtitle: 'View and edit your profile',
                onTap: () => showProfileOverlay(context),
              ),
            ),
            const SizedBox(height: 12),
            
            AnimatedListItem(
              index: 2,
              staggerDelay: const Duration(milliseconds: 100),
              child: _buildActionCard(
                context,
                icon: Icons.explore,
                title: 'Explore Topics',
                subtitle: 'Discover new subjects',
                onTap: () => context.push('/onboarding'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return AnimatedCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: Colors.grey[400],
          ),
        ],
      ),
    );
  }
}
