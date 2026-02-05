import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/teaching_provider.dart';
import '../../widgets/common/animated_list_item.dart';

class TeachingScreen extends ConsumerWidget {
  final String topicId;

  const TeachingScreen({super.key, required this.topicId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final teachingState = ref.watch(teachingProvider);
    final teachingNotifier = ref.read(teachingProvider.notifier);
    final textController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: FadeInWidget(
          delay: const Duration(milliseconds: 100),
          child: Text('Learning: $topicId'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Topic header
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 100),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.book,
                              color: Theme.of(context).primaryColor,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Topic: $topicId',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Interactive Learning Session',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // AI Doubt Resolution Section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 150),
              child: Text(
                'AI Tutor Help',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 200),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Have a doubt? Ask AIra:'),
                      const SizedBox(height: 8),
                      TextField(
                        controller: textController,
                        decoration: const InputDecoration(
                          hintText: 'e.g., What is the P wave?',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: teachingState.isLoading 
                          ? null 
                          : () {
                              if (textController.text.isNotEmpty) {
                                teachingNotifier.resolveDoubt(textController.text, topicId);
                              }
                            },
                        child: teachingState.isLoading 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Ask AI'),
                      ),
                      if (teachingState.lastDoubtResolution != null) ...[
                        const SizedBox(height: 16),
                        const Divider(),
                        const SizedBox(height: 8),
                        Text(
                          'Explanation:',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor),
                        ),
                        const SizedBox(height: 4),
                        Text(teachingState.lastDoubtResolution!['explanation'] ?? ''),
                      ],
                      if (teachingState.error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          'Error: ${teachingState.error}',
                          style: const TextStyle(color: Colors.red),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Progress section
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 200),
              child: Text(
                'Your Progress',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 250),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Completion'),
                          Text(
                            '0%',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: 0.0,
                          backgroundColor: Colors.grey[200],
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Content placeholder / Generated Content
            SlideFadeInWidget(
              delay: const Duration(milliseconds: 300),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Lesson Content',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (teachingState.teachingContent == null)
                    TextButton.icon(
                      onPressed: teachingState.isLoading
                          ? null
                          : () => teachingNotifier.generateTeachingContent(topicId),
                      icon: const Icon(Icons.auto_awesome),
                      label: const Text('Generate with AI'),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            
            if (teachingState.teachingContent != null) ...[
              Text(
                teachingState.teachingContent!['title'] ?? topicId,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              ...(teachingState.teachingContent!['sections'] as List).map((section) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          section['title'] ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        Text(section['content'] ?? ''),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),
              Card(
                color: Theme.of(context).primaryColor.withValues(alpha: 0.05),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Summary',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(teachingState.teachingContent!['summary'] ?? ''),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: ElevatedButton.icon(
                  onPressed: teachingState.isLoading
                      ? null
                      : () => teachingNotifier.generateQuiz(topicId, teachingState.teachingContent!['summary'] ?? ''),
                  icon: const Icon(Icons.quiz),
                  label: const Text('Start Quiz'),
                ),
              ),
              const SizedBox(height: 24),
            ] else ...[
              ...List.generate(
                3,
                (index) => AnimatedListItem(
                  index: index,
                  staggerDelay: const Duration(milliseconds: 100),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AnimatedCard(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Section ${index + 1}',
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Coming soon...',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.lock,
                            color: Colors.grey[400],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],

            if (teachingState.quizQuestions != null) ...[
              const Divider(height: 48),
              Text(
                'Assessment Quiz',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ...teachingState.quizQuestions!.map((q) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          q['question'] ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        ...(q['options'] as List).asMap().entries.map((entry) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: OutlinedButton(
                              onPressed: () {
                                // Simple feedback logic
                                final isCorrect = entry.key == q['correctAnswer'];
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(isCorrect ? 'Correct! ${q['explanation']}' : 'Incorrect. Try again!'),
                                    backgroundColor: isCorrect ? Colors.green : Colors.red,
                                  ),
                                );
                              },
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Text(entry.value),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
