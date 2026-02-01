import 'package:flutter/material.dart';

class TeachingScreen extends StatelessWidget {
  final String topicId;

  const TeachingScreen({super.key, required this.topicId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Learning: $topicId'),
      ),
      body: Center(
        child: Text('Teaching Screen - Topic: $topicId'),
      ),
    );
  }
}
