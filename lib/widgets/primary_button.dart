import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.filled = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final child = Text(label);
    if (filled) {
      return FilledButton.icon(
        onPressed: onPressed,
        icon: Icon(icon ?? Icons.check),
        label: child,
      );
    }
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon ?? Icons.chevron_right),
      label: child,
    );
  }
}
