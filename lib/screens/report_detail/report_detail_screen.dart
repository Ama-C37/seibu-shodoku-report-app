import 'package:flutter/material.dart';

import '../../models/report.dart';
import '../../routes/app_routes.dart';
import '../../screens/report_form/report_form_screen.dart';
import '../../utils/constants.dart';
import '../../utils/date_formatter.dart';

class ReportDetailScreen extends StatelessWidget {
  const ReportDetailScreen({super.key, required this.report});

  final Report report;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('報告書詳細')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(report.title, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 12),
          _row('種別', ReportTypes.label(report.reportType)),
          _row('状態', ReportStatus.label(report.status)),
          _row('作業日', DateFormatter.date(report.workDate)),
          _row('作業場所', report.locationName),
          _row('報告者', report.reporterName),
          _row('所属支店', report.branchName),
          const SizedBox(height: 12),
          Text(report.content),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.reportForm, arguments: ReportFormArgs(reportType: report.reportType, photoType: report.photoType, report: report)),
            icon: const Icon(Icons.edit),
            label: const Text('編集'),
          ),
          OutlinedButton.icon(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.pdfPreview, arguments: report),
            icon: const Icon(Icons.picture_as_pdf),
            label: const Text('PDF表示'),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [SizedBox(width: 90, child: Text(label)), Expanded(child: Text(value))]),
    );
  }
}
