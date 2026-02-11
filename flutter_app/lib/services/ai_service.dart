import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AIService {
  static const String _defaultBaseUrl = kIsWeb 
      ? 'http://localhost:5000/api'
      : 'http://10.0.2.2:5000/api';

  final String _baseUrl = const String.fromEnvironment('API_URL', defaultValue: _defaultBaseUrl);

  Future<Map<String, String>> _getHeaders() async {
    return {'Content-Type': 'application/json'};
  }

  Future<Map<String, dynamic>> resolveDoubt(String question, String context) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/resolve-doubt'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'question': question,
          'context': context,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to resolve doubt: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error in AIService.resolveDoubt: $e');
      rethrow;
    }
  }

  Future<String> generateResponse(String message, String context) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/generate-content'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'prompt': 'User: $message\nContext: $context\nAI Tutor:',
          'model': 'llama',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['content'] ?? 'No response generated';
      } else {
        throw Exception('Failed to generate response: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error in AIService.generateResponse: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> generateTeachingContent(String topic, {String model = 'llama'}) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/generate-teaching-content'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'topic': topic,
          'model': model,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to generate teaching content: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error in AIService.generateTeachingContent: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> generateQuiz(String topic, {String context = 'General Education', String model = 'llama'}) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/generate-quiz'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'topic': topic,
          'context': context,
          'model': model,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to generate quiz: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error in AIService.generateQuiz: $e');
      rethrow;
    }
  }
}
