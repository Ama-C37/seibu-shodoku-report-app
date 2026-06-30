import 'package:flutter/material.dart';

import '../../services/ai_correction_service.dart';
import '../../utils/constants.dart';

class AiCorrectionScreen extends StatefulWidget {
  const AiCorrectionScreen({super.key, required this.initialText});

  final String initialText;

  @override
  State<AiCorrectionScreen> createState() => _AiCorrectionScreenState();
}

class _AiCorrectionScreenState extends State<AiCorrectionScreen> {
  String? _corrected;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _run();
  }

  Future<void> _run() async {
    try {
      final corrected = await AiCorrectionService().correct(widget.initialText);
      if (mounted) setState(() => _corrected = corrected);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(AppConstants.aiError)));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI添削')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('添削後文章'),
                  const SizedBox(height: 8),
                  Expanded(
                    child: DecoratedBox(
                      decoration: BoxDecoration(border: Border.all(color: Theme.of(context).dividerColor), borderRadius: BorderRadius.circular(4)),
                      child: Padding(padding: const EdgeInsets.all(12), child: SingleChildScrollView(child: Text(_corrected ?? ''))),
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(onPressed: () => Navigator.pop(context, _corrected), icon: const Icon(Icons.check), label: const Text('採用')),
                  OutlinedButton.icon(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close), label: const Text('キャンセル')),
                ],
              ),
      ),
    );
  }
}
