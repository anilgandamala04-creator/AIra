import 'package:flutter/material.dart';

/// Centralized animation utilities for consistent animations throughout the app.
class AnimationUtils {
  // Private constructor to prevent instantiation
  AnimationUtils._();

  // ==================== Duration Constants ====================
  
  /// Ultra-fast animations for micro-interactions (100ms)
  static const Duration ultraFast = Duration(milliseconds: 100);
  
  /// Fast animations for quick feedback (200ms)
  static const Duration fast = Duration(milliseconds: 200);
  
  /// Normal animations for standard transitions (300ms)
  static const Duration normal = Duration(milliseconds: 300);
  
  /// Medium animations for emphasized transitions (400ms)
  static const Duration medium = Duration(milliseconds: 400);
  
  /// Slow animations for dramatic effects (500ms)
  static const Duration slow = Duration(milliseconds: 500);
  
  /// Extra slow animations for very deliberate transitions (700ms)
  static const Duration extraSlow = Duration(milliseconds: 700);

  // ==================== Animation Curves ====================
  
  /// Standard easing curve for most animations
  static const Curve standardCurve = Curves.easeInOut;
  
  /// Curve for elements entering the screen
  static const Curve enterCurve = Curves.easeOutCubic;
  
  /// Curve for elements exiting the screen
  static const Curve exitCurve = Curves.easeInCubic;
  
  /// Curve for bouncy, playful animations
  static const Curve bouncyCurve = Curves.elasticOut;
  
  /// Curve for smooth deceleration
  static const Curve decelerateCurve = Curves.decelerate;
  
  /// Curve for emphasis animations
  static const Curve emphasisCurve = Curves.easeOutBack;

  // ==================== Stagger Delays ====================
  
  /// Calculate stagger delay for list items
  static Duration staggerDelay(int index, {Duration interval = const Duration(milliseconds: 50)}) {
    return Duration(milliseconds: interval.inMilliseconds * index);
  }
  
  /// Maximum stagger delay to prevent slow animations on long lists
  static Duration cappedStaggerDelay(int index, {
    Duration interval = const Duration(milliseconds: 50),
    int maxItems = 10,
  }) {
    final effectiveIndex = index > maxItems ? maxItems : index;
    return Duration(milliseconds: interval.inMilliseconds * effectiveIndex);
  }

  // ==================== Animation Builders ====================
  
  /// Creates a fade transition widget
  static Widget fadeTransition({
    required Animation<double> animation,
    required Widget child,
  }) {
    return FadeTransition(
      opacity: animation,
      child: child,
    );
  }
  
  /// Creates a slide + fade transition widget
  static Widget slideFadeTransition({
    required Animation<double> animation,
    required Widget child,
    Offset beginOffset = const Offset(0.0, 0.1),
  }) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: beginOffset,
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: enterCurve,
      )),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }
  
  /// Creates a scale + fade transition widget
  static Widget scaleFadeTransition({
    required Animation<double> animation,
    required Widget child,
    double beginScale = 0.8,
  }) {
    return ScaleTransition(
      scale: Tween<double>(
        begin: beginScale,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: enterCurve,
      )),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }
}

/// Mixin for widgets that need entry animations
mixin EntryAnimationMixin<T extends StatefulWidget> on State<T>, TickerProviderStateMixin<T> {
  late AnimationController _entryController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: AnimationUtils.normal,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _entryController, curve: AnimationUtils.enterCurve),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.05),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _entryController, curve: AnimationUtils.enterCurve),
    );
    
    // Start animation after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _entryController.forward();
    });
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  Animation<double> get fadeAnimation => _fadeAnimation;
  Animation<Offset> get slideAnimation => _slideAnimation;
  AnimationController get entryController => _entryController;
}

/// Widget wrapper for staggered list animations
class StaggeredAnimationItem extends StatefulWidget {
  final int index;
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset slideOffset;

  const StaggeredAnimationItem({
    super.key,
    required this.index,
    required this.child,
    this.delay = const Duration(milliseconds: 50),
    this.duration = const Duration(milliseconds: 300),
    this.slideOffset = const Offset(0.0, 0.1),
  });

  @override
  State<StaggeredAnimationItem> createState() => _StaggeredAnimationItemState();
}

class _StaggeredAnimationItemState extends State<StaggeredAnimationItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: AnimationUtils.enterCurve),
    );

    _slideAnimation = Tween<Offset>(
      begin: widget.slideOffset,
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: AnimationUtils.enterCurve),
    );

    // Delay based on index
    Future.delayed(
      AnimationUtils.cappedStaggerDelay(widget.index, interval: widget.delay),
      () {
        if (mounted) _controller.forward();
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: widget.child,
      ),
    );
  }
}
