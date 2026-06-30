import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/report.dart';

class ReportRepository {
  static const _key = 'reports';

  Future<List<Report>> findAll() async {
    final prefs = await SharedPreferences.getInstance();
    final values = prefs.getStringList(_key) ?? [];
    return values.map((value) => Report.fromJson(jsonDecode(value) as Map<String, dynamic>)).toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  Future<void> save(Report report) async {
    final reports = await findAll();
    final index = reports.indexWhere((item) => item.reportId == report.reportId);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.add(report);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _key,
      reports.map((item) => jsonEncode(item.toJson())).toList(),
    );
  }

  Future<Report?> findById(String reportId) async {
    final reports = await findAll();
    for (final report in reports) {
      if (report.reportId == reportId) return report;
    }
    return null;
  }
}
