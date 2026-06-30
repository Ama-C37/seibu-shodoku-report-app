import 'package:flutter/material.dart';

import '../models/report.dart';
import '../screens/ai_correction/ai_correction_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/login/login_screen.dart';
import '../screens/pdf_preview/pdf_preview_screen.dart';
import '../screens/photo_manager/photo_manager_screen.dart';
import '../screens/photo_type/photo_type_screen.dart';
import '../screens/report_detail/report_detail_screen.dart';
import '../screens/report_form/report_form_screen.dart';
import '../screens/report_list/report_list_screen.dart';
import '../screens/report_type/report_type_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/splash/splash_screen.dart';

class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const home = '/home';
  static const reportType = '/report-type';
  static const photoType = '/photo-type';
  static const reportForm = '/report-form';
  static const photoManager = '/photo-manager';
  static const aiCorrection = '/ai-correction';
  static const pdfPreview = '/pdf-preview';
  static const reportList = '/report-list';
  static const reportDetail = '/report-detail';
  static const settings = '/settings';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (context) {
        switch (settings.name) {
          case login:
            return const LoginScreen();
          case home:
            return const HomeScreen();
          case reportType:
            return const ReportTypeScreen();
          case photoType:
            return PhotoTypeScreen(reportType: settings.arguments! as String);
          case reportForm:
            return ReportFormScreen(args: settings.arguments! as ReportFormArgs);
          case photoManager:
            return PhotoManagerScreen(args: settings.arguments! as PhotoManagerArgs);
          case aiCorrection:
            return AiCorrectionScreen(initialText: settings.arguments! as String);
          case pdfPreview:
            return PdfPreviewScreen(report: settings.arguments! as Report);
          case reportList:
            return ReportListScreen(status: settings.arguments! as String);
          case reportDetail:
            return ReportDetailScreen(report: settings.arguments! as Report);
          case settings:
            return const SettingsScreen();
          default:
            return const SplashScreen();
        }
      },
      settings: settings,
    );
  }
}
