import 'package:flutter/material.dart';

class AppConstants {
  static const appName = '西武消毒 報告書';
  static const gpsError = '現在地を取得できませんでした。位置情報の許可設定を確認してください。';
  static const photoError = '写真を取得できませんでした。もう一度お試しください。';
  static const aiError = 'AI添削に失敗しました。通信環境を確認してください。';
  static const pdfError = 'PDFの作成に失敗しました。入力内容を確認してください。';
  static const saveError = '保存に失敗しました。通信環境を確認してください。';
}

class AppColors {
  static const primary = Color(0xFF176B4D);
  static const background = Color(0xFFF7F8F5);
}

class ReportTypes {
  static const investigation = 'investigation';
  static const construction = 'construction';

  static String label(String value) {
    return value == construction ? '施工報告書' : '調査報告書';
  }
}

class PhotoTypes {
  static const withPhoto = 'with_photo';
  static const withoutPhoto = 'without_photo';

  static String label(String value) {
    return value == withPhoto ? '写真付き' : '写真なし';
  }
}

class ReportStatus {
  static const draft = 'draft';
  static const submitted = 'submitted';

  static String label(String value) {
    return value == submitted ? '提出済み' : '下書き';
  }
}
