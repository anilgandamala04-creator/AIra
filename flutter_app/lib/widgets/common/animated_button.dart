import 'package:flutter/material.dart';
import '../../utils/animation_utils.dart';

/// Animated button with scale effect on press and optional hover elevation
class AnimatedButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final ButtonStyle? style;
  final bool enableHoverElevation;
  final double pressScale;
  final Duration animationDuration;

  const AnimatedButton({
    super.key,
    required this.child,
    this.onPressed,
    this.style,
    this.enableHoverElevation = true,
    this.pressScale = 0.95,
    this.animationDuration = const Duration(milliseconds: 100),
  });

  @override
  State<AnimatedButton> createState() => _AnimatedButtonState();
}

class _AnimatedButtonState extends State<AnimatedButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.pressScale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: AnimationUtils.standardCurve,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _controller.forward();
  }

  void _onTapUp(TapUpDetails details) {
    _controller.reverse();
  }

  void _onTapCancel() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: widget.onPressed != null ? _onTapDown : null,
        onTapUp: widget.onPressed != null ? _onTapUp : null,
        onTapCancel: widget.onPressed != null ? _onTapCancel : null,
        onTap: widget.onPressed,
        child: AnimatedBuilder(
          animation: _scaleAnimation,
          builder: (context, child) {
            final primaryColor = Theme.of(context).primaryColor;
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: AnimatedContainer(
                duration: AnimationUtils.fast,
                decoration: widget.enableHoverElevation && _isHovered
                    ? BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: primaryColor.withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      )
                    : null,
                child: widget.child,
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Animated elevated button with built-in scale and hover effects
class AnimatedElevatedButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final ButtonStyle? style;
  final double pressScale;

  const AnimatedElevatedButton({
    super.key,
    required this.child,
    this.onPressed,
    this.style,
    this.pressScale = 0.97,
  });

  @override
  State<AnimatedElevatedButton> createState() => _AnimatedElevatedButtonState();
}

class _AnimatedElevatedButtonState extends State<AnimatedElevatedButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AnimationUtils.ultraFast,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.pressScale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: AnimationUtils.standardCurve,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null ? (_) => _controller.forward() : null,
      onTapUp: widget.onPressed != null ? (_) => _controller.reverse() : null,
      onTapCancel: widget.onPressed != null ? () => _controller.reverse() : null,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: ElevatedButton(
          onPressed: widget.onPressed,
          style: widget.style,
          child: widget.child,
        ),
      ),
    );
  }
}

/// Animated outlined button with built-in scale effects
class AnimatedOutlinedButton extends StatefulWidget {
  final Widget child;
  final Widget? icon;
  final VoidCallback? onPressed;
  final ButtonStyle? style;
  final double pressScale;

  const AnimatedOutlinedButton({
    super.key,
    required this.child,
    this.icon,
    this.onPressed,
    this.style,
    this.pressScale = 0.97,
  });

  @override
  State<AnimatedOutlinedButton> createState() => _AnimatedOutlinedButtonState();
}

class _AnimatedOutlinedButtonState extends State<AnimatedOutlinedButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AnimationUtils.ultraFast,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.pressScale,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: AnimationUtils.standardCurve,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null ? (_) => _controller.forward() : null,
      onTapUp: widget.onPressed != null ? (_) => _controller.reverse() : null,
      onTapCancel: widget.onPressed != null ? () => _controller.reverse() : null,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: widget.icon != null
            ? OutlinedButton.icon(
                onPressed: widget.onPressed,
                icon: widget.icon!,
                label: widget.child,
                style: widget.style,
              )
            : OutlinedButton(
                onPressed: widget.onPressed,
                style: widget.style,
                child: widget.child,
              ),
      ),
    );
  }
}
