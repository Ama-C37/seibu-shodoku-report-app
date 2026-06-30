import 'package:flutter/material.dart';

import '../models/report.dart';
import '../utils/constants.dart';
import '../utils/date_formatter.dart';

class ReportCard extends StatelessWidget {
  const ReportCard({super.key, required this.report, required this.onTap});

  final Report report;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        title: Text(report.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text('${ReportTypes.label(report.reportType)} / ${DateFormatter.date(report.workDate)}'),
        trailing: Text(ReportStatus.label(report.status)),
      ),
    );
  }
}
