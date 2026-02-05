import 'package:flutter/material.dart';
import '../../utils/animation_utils.dart';

/// Animated list item with staggered fade and slide animation
class AnimatedListItem extends StatefulWidget {
  final int index;
  final Widget child;
  final Duration staggerDelay;
  final Duration animationDuration;
  final Offset slideOffset;
  final Curve curve;

  const AnimatedListItem({
    super.key,
    required this.index,
    required this.child,
    this.staggerDelay = const Duration(milliseconds: 50),
    this.animationDuration = const Duration(milliseconds: 400),
    this.slideOffset = const Offset(0.0, 0.1),
    this.curve = Curves.easeOutCubic,
  });

  @override
  State<AnimatedListItem> createState() => _AnimatedListItemState();
}

class _AnimatedListItemState extends State<AnimatedListItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    _slideAnimation = Tween<Offset>(
      begin: widget.slideOffset,
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    // Calculate capped delay based on index
    final delay = AnimationUtils.cappedStaggerDelay(
      widget.index,
      interval: widget.staggerDelay,
      maxItems: 15,
    );

    Future.delayed(delay, () {
      if (mounted) _controller.forward();
    });
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

/// Animated card with hover and tap effects
class AnimatedCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets? margin;
  final EdgeInsets? padding;
  final double elevation;
  final double hoverElevation;
  final Color? color;
  final BorderRadius? borderRadius;

  const AnimatedCard({
    super.key,
    required this.child,
    this.onTap,
    this.margin,
    this.padding,
    this.elevation = 2,
    this.hoverElevation = 8,
    this.color,
    this.borderRadius,
  });

  @override
  State<AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AnimationUtils.ultraFast,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: AnimationUtils.standardCurve),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final borderRadius = widget.borderRadius ?? BorderRadius.circular(12);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: widget.onTap != null ? (_) => _controller.forward() : null,
        onTapUp: widget.onTap != null ? (_) => _controller.reverse() : null,
        onTapCancel: widget.onTap != null ? () => _controller.reverse() : null,
        onTap: widget.onTap,
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: AnimatedContainer(
            duration: AnimationUtils.fast,
            margin: widget.margin,
            decoration: BoxDecoration(
              color: widget.color ?? Theme.of(context).cardColor,
              borderRadius: borderRadius,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: _isHovered ? 0.15 : 0.1),
                  blurRadius: _isHovered ? widget.hoverElevation : widget.elevation,
                  offset: Offset(0, _isHovered ? 4 : 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: borderRadius,
              child: Material(
                color: Colors.transparent,
                child: Padding(
                  padding: widget.padding ?? EdgeInsets.zero,
                  child: widget.child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Fade in widget that animates on first build
class FadeInWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Curve curve;

  const FadeInWidget({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 300),
    this.curve = Curves.easeOut,
  });

  @override
  State<FadeInWidget> createState() => _FadeInWidgetState();
}

class _FadeInWidgetState extends State<FadeInWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: widget.child,
    );
  }
}

/// Slide fade in widget that animates on first build
class SlideFadeInWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset slideOffset;
  final Curve curve;

  const SlideFadeInWidget({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 400),
    this.slideOffset = const Offset(0.0, 0.1),
    this.curve = Curves.easeOutCubic,
  });

  @override
  State<SlideFadeInWidget> createState() => _SlideFadeInWidgetState();
}

class _SlideFadeInWidgetState extends State<SlideFadeInWidget>
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
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    _slideAnimation = Tween<Offset>(
      begin: widget.slideOffset,
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
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

/// Scale fade in widget that animates on first build
class ScaleFadeInWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final double beginScale;
  final Curve curve;

  const ScaleFadeInWidget({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 400),
    this.beginScale = 0.9,
    this.curve = Curves.easeOutCubic,
  });

  @override
  State<ScaleFadeInWidget> createState() => _ScaleFadeInWidgetState();
}

class _ScaleFadeInWidgetState extends State<ScaleFadeInWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    _scaleAnimation = Tween<double>(
      begin: widget.beginScale,
      end: 1.0,
    ).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: widget.child,
      ),
    );
  }
}
