import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/report.dart';
import '../repositories/report_repository.dart';

final reportRepositoryProvider = Provider<ReportRepository>((ref) => ReportRepository());

final reportsProvider = StateNotifierProvider<ReportsNotifier, AsyncValue<List<Report>>>((ref) {
  return ReportsNotifier(ref.read(reportRepositoryProvider))..load();
});

class ReportsNotifier extends StateNotifier<AsyncValue<List<Report>>> {
  ReportsNotifier(this._repository) : super(const AsyncValue.loading());

  final ReportRepository _repository;

  Future<void> load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(_repository.findAll);
  }

  Future<void> save(Report report) async {
    await _repository.save(report);
    await load();
  }
}
