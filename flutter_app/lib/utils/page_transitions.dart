import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'animation_utils.dart';

/// Custom page route with fade and slide transition
class FadeSlidePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final SlideDirection slideDirection;

  FadeSlidePageRoute({
    required this.page,
    this.slideDirection = SlideDirection.up,
    super.settings,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: AnimationUtils.normal,
          reverseTransitionDuration: AnimationUtils.fast,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final offsetTween = Tween<Offset>(
              begin: _getSlideOffset(slideDirection),
              end: Offset.zero,
            );
            
            final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
            
            final curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: AnimationUtils.enterCurve,
              reverseCurve: AnimationUtils.exitCurve,
            );

            return SlideTransition(
              position: offsetTween.animate(curvedAnimation),
              child: FadeTransition(
                opacity: fadeTween.animate(curvedAnimation),
                child: child,
              ),
            );
          },
        );

  static Offset _getSlideOffset(SlideDirection direction) {
    switch (direction) {
      case SlideDirection.up:
        return const Offset(0.0, 0.1);
      case SlideDirection.down:
        return const Offset(0.0, -0.1);
      case SlideDirection.left:
        return const Offset(0.1, 0.0);
      case SlideDirection.right:
        return const Offset(-0.1, 0.0);
    }
  }
}

/// Custom page route with scale transition (for modals/overlays)
class ScalePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  ScalePageRoute({
    required this.page,
    super.settings,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: AnimationUtils.normal,
          reverseTransitionDuration: AnimationUtils.fast,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final scaleTween = Tween<double>(begin: 0.9, end: 1.0);
            final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
            
            final curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: AnimationUtils.emphasisCurve,
              reverseCurve: AnimationUtils.exitCurve,
            );

            return ScaleTransition(
              scale: scaleTween.animate(curvedAnimation),
              child: FadeTransition(
                opacity: fadeTween.animate(curvedAnimation),
                child: child,
              ),
            );
          },
        );
}

/// Custom page route with pure slide transition
class SlidePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final SlideDirection direction;

  SlidePageRoute({
    required this.page,
    this.direction = SlideDirection.left,
    super.settings,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: AnimationUtils.normal,
          reverseTransitionDuration: AnimationUtils.fast,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final beginOffset = _getFullSlideOffset(direction);
            
            final offsetTween = Tween<Offset>(
              begin: beginOffset,
              end: Offset.zero,
            );
            
            final curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: AnimationUtils.enterCurve,
              reverseCurve: AnimationUtils.exitCurve,
            );

            return SlideTransition(
              position: offsetTween.animate(curvedAnimation),
              child: child,
            );
          },
        );

  static Offset _getFullSlideOffset(SlideDirection direction) {
    switch (direction) {
      case SlideDirection.up:
        return const Offset(0.0, 1.0);
      case SlideDirection.down:
        return const Offset(0.0, -1.0);
      case SlideDirection.left:
        return const Offset(1.0, 0.0);
      case SlideDirection.right:
        return const Offset(-1.0, 0.0);
    }
  }
}

/// Pure fade page route
class FadePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  FadePageRoute({
    required this.page,
    super.settings,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: AnimationUtils.normal,
          reverseTransitionDuration: AnimationUtils.fast,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
            
            final curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: AnimationUtils.standardCurve,
            );

            return FadeTransition(
              opacity: fadeTween.animate(curvedAnimation),
              child: child,
            );
          },
        );
}

/// Enum for slide directions
enum SlideDirection {
  up,
  down,
  left,
  right,
}

/// Extension to create custom page with go_router
extension CustomPageBuilder on Widget {
  /// Creates a custom page with fade and slide transition for go_router
  CustomTransitionPage<void> toFadeSlidePage({
    SlideDirection direction = SlideDirection.up,
    LocalKey? key,
  }) {
    return CustomTransitionPage<void>(
      key: key,
      child: this,
      transitionDuration: AnimationUtils.normal,
      reverseTransitionDuration: AnimationUtils.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final offsetTween = Tween<Offset>(
          begin: _getSlideOffset(direction),
          end: Offset.zero,
        );
        
        final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
        
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: AnimationUtils.enterCurve,
          reverseCurve: AnimationUtils.exitCurve,
        );

        return SlideTransition(
          position: offsetTween.animate(curvedAnimation),
          child: FadeTransition(
            opacity: fadeTween.animate(curvedAnimation),
            child: child,
          ),
        );
      },
    );
  }

  /// Creates a custom page with scale transition for go_router
  CustomTransitionPage<void> toScalePage({LocalKey? key}) {
    return CustomTransitionPage<void>(
      key: key,
      child: this,
      transitionDuration: AnimationUtils.normal,
      reverseTransitionDuration: AnimationUtils.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final scaleTween = Tween<double>(begin: 0.9, end: 1.0);
        final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
        
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: AnimationUtils.emphasisCurve,
          reverseCurve: AnimationUtils.exitCurve,
        );

        return ScaleTransition(
          scale: scaleTween.animate(curvedAnimation),
          child: FadeTransition(
            opacity: fadeTween.animate(curvedAnimation),
            child: child,
          ),
        );
      },
    );
  }

  /// Creates a custom page with pure slide transition for go_router
  CustomTransitionPage<void> toSlidePage({
    SlideDirection direction = SlideDirection.left,
    LocalKey? key,
  }) {
    return CustomTransitionPage<void>(
      key: key,
      child: this,
      transitionDuration: AnimationUtils.normal,
      reverseTransitionDuration: AnimationUtils.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final beginOffset = _getFullSlideOffset(direction);
        
        final offsetTween = Tween<Offset>(
          begin: beginOffset,
          end: Offset.zero,
        );
        
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: AnimationUtils.enterCurve,
          reverseCurve: AnimationUtils.exitCurve,
        );

        return SlideTransition(
          position: offsetTween.animate(curvedAnimation),
          child: child,
        );
      },
    );
  }

  /// Creates a custom page with pure fade transition for go_router
  CustomTransitionPage<void> toFadePage({LocalKey? key}) {
    return CustomTransitionPage<void>(
      key: key,
      child: this,
      transitionDuration: AnimationUtils.normal,
      reverseTransitionDuration: AnimationUtils.fast,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final fadeTween = Tween<double>(begin: 0.0, end: 1.0);
        
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: AnimationUtils.standardCurve,
        );

        return FadeTransition(
          opacity: fadeTween.animate(curvedAnimation),
          child: child,
        );
      },
    );
  }

  static Offset _getSlideOffset(SlideDirection direction) {
    switch (direction) {
      case SlideDirection.up:
        return const Offset(0.0, 0.1);
      case SlideDirection.down:
        return const Offset(0.0, -0.1);
      case SlideDirection.left:
        return const Offset(0.1, 0.0);
      case SlideDirection.right:
        return const Offset(-0.1, 0.0);
    }
  }

  static Offset _getFullSlideOffset(SlideDirection direction) {
    switch (direction) {
      case SlideDirection.up:
        return const Offset(0.0, 1.0);
      case SlideDirection.down:
        return const Offset(0.0, -1.0);
      case SlideDirection.left:
        return const Offset(1.0, 0.0);
      case SlideDirection.right:
        return const Offset(-1.0, 0.0);
    }
  }
}
