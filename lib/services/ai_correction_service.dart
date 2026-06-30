class AiCorrectionService {
  Future<String> correct(String text) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    final trimmed = text.trim();
    if (trimmed.isEmpty) return '';
    return trimmed
        .replaceAll('です。です。', 'です。')
        .replaceAll('ました。ました。', 'ました。')
        .replaceAll(RegExp(r'\n{3,}'), '\n\n');
  }
}
