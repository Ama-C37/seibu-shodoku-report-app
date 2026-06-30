import 'package:flutter/material.dart';

import '../../routes/app_routes.dart';
import '../../screens/report_form/report_form_screen.dart';
import '../../utils/constants.dart';

class PhotoTypeScreen extends StatelessWidget {
  const PhotoTypeScreen({super.key, required this.reportType});

  final String reportType;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('写真有無')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _tile(context, '写真付き', PhotoTypes.withPhoto),
          _tile(context, '写真なし', PhotoTypes.withoutPhoto),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, String title, String value) {
    return Card(
      child: ListTile(
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.pushNamed(
          context,
          AppRoutes.reportForm,
          arguments: ReportFormArgs(reportType: reportType, photoType: value),
        ),
      ),
    );
  }
}
