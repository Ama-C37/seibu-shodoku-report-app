class Validators {
  static String? requiredText(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$labelを入力してください';
    }
    return null;
  }

  static String? maxLength(String? value, int max, String label) {
    if (value != null && value.length > max) {
      return '$labelは$max文字以内で入力してください';
    }
    return null;
  }
}
