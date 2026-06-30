import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../routes/app_routes.dart';
import '../../utils/constants.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('ホーム')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Icon(Icons.description, size: 56, color: AppColors.primary),
          const SizedBox(height: 12),
          Text(user?.name ?? '未ログイン', style: Theme.of(context).textTheme.titleLarge),
          Text(user?.branchName.isEmpty == true ? '所属支店未設定' : user?.branchName ?? ''),
          const SizedBox(height: 24),
          _menu(context, '新規報告書作成', Icons.add_circle_outline, AppRoutes.reportType),
          _menu(context, '下書き一覧', Icons.folder_open, AppRoutes.reportList, ReportStatus.draft),
          _menu(context, '提出済み一覧', Icons.task_alt, AppRoutes.reportList, ReportStatus.submitted),
          _menu(context, '設定', Icons.settings, AppRoutes.settings),
        ],
      ),
    );
  }

  Widget _menu(BuildContext context, String title, IconData icon, String route, [Object? args]) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.pushNamed(context, route, arguments: args),
      ),
    );
  }
}
