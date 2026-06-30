import 'package:flutter/material.dart';

import '../../routes/app_routes.dart';
import '../../utils/constants.dart';

class ReportTypeScreen extends StatelessWidget {
  const ReportTypeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('報告書種別')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _tile(context, '調査報告書', ReportTypes.investigation),
          _tile(context, '施工報告書', ReportTypes.construction),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, String title, String value) {
    return Card(
      child: ListTile(
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.pushNamed(context, AppRoutes.photoType, arguments: value),
      ),
    );
  }
}
