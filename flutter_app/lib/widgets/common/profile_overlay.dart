import 'package:flutter/material.dart';
import 'animated_list_item.dart';
import '../../utils/animation_utils.dart';

/// Shows the profile panel as a central overlay
Future<void> showProfileOverlay(BuildContext context) {
  return showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Profile',
    barrierColor: Colors.black54,
    transitionDuration: AnimationUtils.normal,
    pageBuilder: (context, animation, secondaryAnimation) {
      return const ProfileOverlayPanel();
    },
    transitionBuilder: (context, animation, secondaryAnimation, child) {
      final curvedAnimation = CurvedAnimation(
        parent: animation,
        curve: AnimationUtils.enterCurve,
        reverseCurve: AnimationUtils.exitCurve,
      );
      
      return ScaleTransition(
        scale: Tween<double>(begin: 0.9, end: 1.0).animate(curvedAnimation),
        child: FadeTransition(
          opacity: curvedAnimation,
          child: child,
        ),
      );
    },
  );
}

/// Profile overlay panel widget
class ProfileOverlayPanel extends StatelessWidget {
  const ProfileOverlayPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isSmallScreen = screenSize.width < 600;
    final isMediumScreen = screenSize.width >= 600 && screenSize.width < 900;
    
    // Responsive sizing
    final panelWidth = isSmallScreen 
        ? screenSize.width * 0.95 
        : isMediumScreen 
            ? screenSize.width * 0.75 
            : 500.0;
    
    final panelHeight = isSmallScreen
        ? screenSize.height * 0.9
        : screenSize.height * 0.85;

    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: panelWidth,
          height: panelHeight,
          constraints: BoxConstraints(
            maxWidth: 600,
            maxHeight: screenSize.height * 0.9,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(isSmallScreen ? 16 : 24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(51), // 0.2 * 255 = 51
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(isSmallScreen ? 16 : 24),
            child: const ProfileOverlayContent(),
          ),
        ),
      ),
    );
  }
}

/// Content of the profile overlay
class ProfileOverlayContent extends StatelessWidget {
  const ProfileOverlayContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header with close button
        _buildHeader(context),
        
        // Scrollable content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Profile avatar and info
                _buildProfileSection(context),
                const SizedBox(height: 24),
                
                // Stats section
                _buildStatsSection(context),
                const SizedBox(height: 24),
                
                // Menu items
                _buildMenuSection(context),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.withAlpha(51), // 0.2 * 255 = 51
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          FadeInWidget(
            delay: const Duration(milliseconds: 100),
            child: Text(
              'Profile',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const Spacer(),
          FadeInWidget(
            delay: const Duration(milliseconds: 150),
            child: IconButton(
              onPressed: () => Navigator.of(context).pop(),
              icon: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.grey.withAlpha(26), // 0.1 * 255 = 26
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileSection(BuildContext context) {
    return ScaleFadeInWidget(
      delay: const Duration(milliseconds: 150),
      beginScale: 0.9,
      child: Column(
        children: [
          // Avatar
          CircleAvatar(
            radius: 50,
            backgroundColor: Theme.of(context).primaryColor.withAlpha(26),
            child: Icon(
              Icons.person,
              size: 50,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 16),
          // Name
          Text(
            'Guest User',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Learning enthusiast',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          // Edit profile button
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.edit, size: 18),
            label: const Text('Edit Profile'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SlideFadeInWidget(
          delay: const Duration(milliseconds: 250),
          child: Text(
            'Learning Stats',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth > 400;
            
            if (isWide) {
              return Row(
                children: [
                  Expanded(
                    child: AnimatedListItem(
                      index: 0,
                      staggerDelay: const Duration(milliseconds: 80),
                      child: _buildStatCard(context, '0', 'Courses', Icons.book),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AnimatedListItem(
                      index: 1,
                      staggerDelay: const Duration(milliseconds: 80),
                      child: _buildStatCard(context, '0h', 'Learning', Icons.timer),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AnimatedListItem(
                      index: 2,
                      staggerDelay: const Duration(milliseconds: 80),
                      child: _buildStatCard(context, '0', 'Streak', Icons.local_fire_department),
                    ),
                  ),
                ],
              );
            } else {
              return Column(
                children: [
                  AnimatedListItem(
                    index: 0,
                    staggerDelay: const Duration(milliseconds: 80),
                    child: _buildStatCard(context, '0', 'Courses', Icons.book),
                  ),
                  const SizedBox(height: 8),
                  AnimatedListItem(
                    index: 1,
                    staggerDelay: const Duration(milliseconds: 80),
                    child: _buildStatCard(context, '0h', 'Learning', Icons.timer),
                  ),
                  const SizedBox(height: 8),
                  AnimatedListItem(
                    index: 2,
                    staggerDelay: const Duration(milliseconds: 80),
                    child: _buildStatCard(context, '0', 'Streak', Icons.local_fire_department),
                  ),
                ],
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.withAlpha(51),
        ),
      ),
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

  Widget _buildMenuSection(BuildContext context) {
    final menuItems = [
      {'icon': Icons.notifications, 'title': 'Notifications'},
      {'icon': Icons.security, 'title': 'Privacy & Security'},
      {'icon': Icons.help, 'title': 'Help & Support'},
      {'icon': Icons.info, 'title': 'About'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SlideFadeInWidget(
          delay: const Duration(milliseconds: 400),
          child: Text(
            'Account',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        ...List.generate(
          menuItems.length,
          (index) => AnimatedListItem(
            index: index,
            staggerDelay: const Duration(milliseconds: 60),
            child: Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _buildMenuItem(
                context,
                icon: menuItems[index]['icon'] as IconData,
                title: menuItems[index]['title'] as String,
                onTap: () {},
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Sign out button
        SlideFadeInWidget(
          delay: const Duration(milliseconds: 600),
          child: SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.logout, color: Colors.red, size: 20),
              label: const Text(
                'Sign Out',
                style: TextStyle(color: Colors.red),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey.withAlpha(51),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withAlpha(26),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: Theme.of(context).primaryColor, size: 20),
            ),
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
