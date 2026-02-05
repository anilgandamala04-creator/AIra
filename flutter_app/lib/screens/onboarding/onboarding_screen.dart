import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/common/animated_list_item.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _selectedProfessionIndex = -1;

  final List<Map<String, dynamic>> _professions = [
    {'icon': Icons.school, 'title': 'Student', 'subtitle': 'Learning for school or college'},
    {'icon': Icons.work, 'title': 'Professional', 'subtitle': 'Upskilling for work'},
    {'icon': Icons.science, 'title': 'Researcher', 'subtitle': 'Academic or scientific research'},
    {'icon': Icons.brush, 'title': 'Creative', 'subtitle': 'Art, design, or content creation'},
    {'icon': Icons.code, 'title': 'Developer', 'subtitle': 'Software and technology'},
    {'icon': Icons.more_horiz, 'title': 'Other', 'subtitle': 'Something else'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: FadeInWidget(
          delay: const Duration(milliseconds: 50),
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        title: const FadeInWidget(
          delay: Duration(milliseconds: 100),
          child: Text('Select Your Profession'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _professions.length,
              itemBuilder: (context, index) {
                final profession = _professions[index];
                final isSelected = _selectedProfessionIndex == index;
                
                return AnimatedListItem(
                  index: index,
                  staggerDelay: const Duration(milliseconds: 80),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected 
                              ? Theme.of(context).primaryColor 
                              : Colors.grey[300]!,
                          width: isSelected ? 2 : 1,
                        ),
                        color: isSelected 
                            ? Theme.of(context).primaryColor.withValues(alpha: 0.05)
                            : null,
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        leading: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Theme.of(context).primaryColor.withValues(alpha: 0.2)
                                : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            profession['icon'] as IconData,
                            color: isSelected
                                ? Theme.of(context).primaryColor
                                : Colors.grey[600],
                          ),
                        ),
                        title: Text(
                          profession['title'] as String,
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                        subtitle: Text(
                          profession['subtitle'] as String,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 13,
                          ),
                        ),
                        trailing: AnimatedOpacity(
                          duration: const Duration(milliseconds: 200),
                          opacity: isSelected ? 1.0 : 0.0,
                          child: Icon(
                            Icons.check_circle,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                        onTap: () {
                          setState(() {
                            _selectedProfessionIndex = index;
                          });
                        },
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          // Continue button
          SlideFadeInWidget(
            delay: Duration(milliseconds: _professions.length * 80 + 100),
            slideOffset: const Offset(0, 0.2),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _selectedProfessionIndex >= 0
                      ? () => context.go('/dashboard')
                      : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Continue'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
