import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ai_service.dart';

final aiServiceProvider = Provider((ref) => AIService());

final teachingProvider = StateNotifierProvider<TeachingNotifier, TeachingState>((ref) {
  final aiService = ref.watch(aiServiceProvider);
  return TeachingNotifier(aiService);
});

class TeachingState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? lastDoubtResolution;
  final Map<String, dynamic>? teachingContent;
  final List<dynamic>? quizQuestions;

  TeachingState({
    this.isLoading = false,
    this.error,
    this.lastDoubtResolution,
    this.teachingContent,
    this.quizQuestions,
  });

  TeachingState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? lastDoubtResolution,
    Map<String, dynamic>? teachingContent,
    List<dynamic>? quizQuestions,
  }) {
    return TeachingState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastDoubtResolution: lastDoubtResolution ?? this.lastDoubtResolution,
      teachingContent: teachingContent ?? this.teachingContent,
      quizQuestions: quizQuestions ?? this.quizQuestions,
    );
  }
}

class TeachingNotifier extends StateNotifier<TeachingState> {
  final AIService _aiService;

  TeachingNotifier(this._aiService) : super(TeachingState());

  Future<void> resolveDoubt(String question, String context) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final resolution = await _aiService.resolveDoubt(question, context);
      state = state.copyWith(isLoading: false, lastDoubtResolution: resolution);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> generateTeachingContent(String topic) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final content = await _aiService.generateTeachingContent(topic);
      state = state.copyWith(isLoading: false, teachingContent: content);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> generateQuiz(String topic, String context) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final quiz = await _aiService.generateQuiz(topic, context: context);
      state = state.copyWith(isLoading: false, quizQuestions: quiz['questions']);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
