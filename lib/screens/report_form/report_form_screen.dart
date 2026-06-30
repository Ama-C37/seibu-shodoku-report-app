import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../models/report.dart';
import '../../models/report_photo.dart';
import '../../providers/auth_provider.dart';
import '../../providers/report_provider.dart';
import '../../routes/app_routes.dart';
import '../../services/gps_service.dart';
import '../../utils/constants.dart';
import '../../utils/validators.dart';
import '../../widgets/loading_overlay.dart';
import '../../widgets/primary_button.dart';

class ReportFormArgs {
  const ReportFormArgs({
    required this.reportType,
    required this.photoType,
    this.report,
  });

  final String reportType;
  final String photoType;
  final Report? report;
}

class ReportFormScreen extends ConsumerStatefulWidget {
  const ReportFormScreen({super.key, required this.args});

  final ReportFormArgs args;

  @override
  ConsumerState<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends ConsumerState<ReportFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _location = TextEditingController();
  final _address = TextEditingController();
  final _reporter = TextEditingController();
  final _branch = TextEditingController();
  final _content = TextEditingController();
  final _remarks = TextEditingController();
  DateTime _workDate = DateTime.now();
  double? _latitude;
  double? _longitude;
  List<ReportPhoto> _photos = [];
  bool _loading = false;
  late final String _reportId;

  @override
  void initState() {
    super.initState();
    final report = widget.args.report;
    _reportId = report?.reportId ?? const Uuid().v4();
    final user = ref.read(authProvider);
    if (report != null) {
      _title.text = report.title;
      _location.text = report.locationName;
      _address.text = report.address;
      _reporter.text = report.reporterName;
      _branch.text = report.branchName;
      _content.text = report.content;
      _remarks.text = report.remarks;
      _workDate = report.workDate;
      _latitude = report.latitude;
      _longitude = report.longitude;
      _photos = [...report.photos];
    } else {
      _reporter.text = user?.name == '未ログイン' ? '' : user?.name ?? '';
      _branch.text = user?.branchName ?? '';
    }
  }

  @override
  void dispose() {
    _title.dispose();
    _location.dispose();
    _address.dispose();
    _reporter.dispose();
    _branch.dispose();
    _content.dispose();
    _remarks.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final selected = await showDatePicker(
      context: context,
      initialDate: _workDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      locale: const Locale('ja', 'JP'),
    );
    if (selected != null) setState(() => _workDate = selected);
  }

  Future<void> _getGps() async {
    setState(() => _loading = true);
    try {
      final position = await GpsService().getCurrentPosition();
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
      });
    } catch (_) {
      if (mounted) _showSnack(AppConstants.gpsError);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openAiCorrection() async {
    final corrected = await Navigator.pushNamed(context, AppRoutes.aiCorrection, arguments: _content.text);
    if (corrected is String) _content.text = corrected;
  }

  Future<void> _openPhotoManager() async {
    final result = await Navigator.pushNamed(
      context,
      AppRoutes.photoManager,
      arguments: PhotoManagerArgs(reportId: _reportId, photos: _photos),
    );
    if (result is List<ReportPhoto>) setState(() => _photos = result);
  }

  Future<void> _save(String status) async {
    if (!_formKey.currentState!.validate()) return;
    if (widget.args.photoType == PhotoTypes.withPhoto && _photos.isEmpty) {
      _showSnack('写真付き報告書は写真を1枚以上追加してください');
      return;
    }
    final report = _buildReport(status);
    try {
      await ref.read(reportsProvider.notifier).save(report);
      if (!mounted) return;
      _showSnack('保存しました');
      Navigator.pushNamedAndRemoveUntil(context, AppRoutes.home, (route) => false);
    } catch (_) {
      _showSnack(AppConstants.saveError);
    }
  }

  void _previewPdf() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.pushNamed(context, AppRoutes.pdfPreview, arguments: _buildReport(ReportStatus.draft));
  }

  Report _buildReport(String status) {
    final now = DateTime.now();
    final existing = widget.args.report;
    final user = ref.read(authProvider);
    return Report(
      reportId: _reportId,
      reportType: widget.args.reportType,
      photoType: widget.args.photoType,
      title: _title.text.trim(),
      workDate: _workDate,
      locationName: _location.text.trim(),
      address: _address.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      reporterId: user?.userId ?? 'guest',
      reporterName: _reporter.text.trim(),
      branchId: user?.branchId ?? '',
      branchName: _branch.text.trim(),
      content: _content.text.trim(),
      correctedContent: '',
      remarks: _remarks.text.trim(),
      status: status,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      submittedAt: status == ReportStatus.submitted ? now : existing?.submittedAt,
      photos: _photos,
    );
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      loading: _loading,
      child: Scaffold(
        appBar: AppBar(title: const Text('報告書入力')),
        body: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('${ReportTypes.label(widget.args.reportType)} / ${PhotoTypes.label(widget.args.photoType)}'),
              const SizedBox(height: 16),
              TextFormField(controller: _title, decoration: const InputDecoration(labelText: '報告書タイトル'), validator: (v) => Validators.requiredText(v, '報告書タイトル') ?? Validators.maxLength(v, 100, '報告書タイトル')),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('作業日'),
                subtitle: Text('${_workDate.year}/${_workDate.month}/${_workDate.day}'),
                trailing: const Icon(Icons.calendar_month),
                onTap: _pickDate,
              ),
              TextFormField(controller: _location, decoration: const InputDecoration(labelText: '作業場所'), validator: (v) => Validators.requiredText(v, '作業場所')),
              const SizedBox(height: 12),
              TextFormField(controller: _address, decoration: const InputDecoration(labelText: '住所')),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: Text(_latitude == null ? 'GPS未取得' : '緯度 $_latitude\n経度 $_longitude')),
                  OutlinedButton.icon(onPressed: _getGps, icon: const Icon(Icons.my_location), label: const Text('取得')),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(controller: _reporter, decoration: const InputDecoration(labelText: '報告者名'), validator: (v) => Validators.requiredText(v, '報告者名')),
              const SizedBox(height: 12),
              TextFormField(controller: _branch, decoration: const InputDecoration(labelText: '所属支店')),
              const SizedBox(height: 12),
              TextFormField(controller: _content, minLines: 7, maxLines: 12, maxLength: 3000, decoration: const InputDecoration(labelText: '報告内容'), validator: (v) => Validators.requiredText(v, '報告内容') ?? Validators.maxLength(v, 3000, '報告内容')),
              Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton.icon(onPressed: _openAiCorrection, icon: const Icon(Icons.auto_fix_high), label: const Text('AI添削')),
              ),
              const SizedBox(height: 12),
              TextFormField(controller: _remarks, minLines: 3, maxLines: 5, maxLength: 1000, decoration: const InputDecoration(labelText: '備考'), validator: (v) => Validators.maxLength(v, 1000, '備考')),
              if (widget.args.photoType == PhotoTypes.withPhoto) ...[
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.photo_library_outlined),
                  title: Text('写真管理 (${_photos.length}枚)'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _openPhotoManager,
                ),
              ],
              const SizedBox(height: 20),
              PrimaryButton(label: 'PDF確認', icon: Icons.picture_as_pdf, onPressed: _previewPdf),
              const SizedBox(height: 8),
              PrimaryButton(label: '下書き保存', icon: Icons.save_outlined, filled: false, onPressed: () => _save(ReportStatus.draft)),
              const SizedBox(height: 8),
              PrimaryButton(label: '提出済み保存', icon: Icons.task_alt, onPressed: () => _save(ReportStatus.submitted)),
            ],
          ),
        ),
      ),
    );
  }
}
