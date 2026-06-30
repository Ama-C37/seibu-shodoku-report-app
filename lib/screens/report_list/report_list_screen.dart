import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/report_provider.dart';
import '../../routes/app_routes.dart';
import '../../utils/constants.dart';
import '../../widgets/report_card.dart';

class ReportListScreen extends ConsumerWidget {
  const ReportListScreen({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reports = ref.watch(reportsProvider);
    return Scaffold(
      appBar: AppBar(title: Text('${ReportStatus.label(status)}一覧')),
      body: reports.when(
        data: (items) {
          final filtered = items.where((item) => item.status == status).toList();
          if (filtered.isEmpty) return const Center(child: Text('報告書はありません'));
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: filtered.length,
            itemBuilder: (context, index) => ReportCard(
              report: filtered[index],
              onTap: () => Navigator.pushNamed(context, AppRoutes.reportDetail, arguments: filtered[index]),
            ),
          );
        },
        error: (_, __) => const Center(child: Text(AppConstants.saveError)),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
