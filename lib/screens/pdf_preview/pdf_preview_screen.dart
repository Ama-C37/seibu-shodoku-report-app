import 'package:flutter/material.dart';
import 'package:printing/printing.dart';

import '../../models/report.dart';
import '../../services/pdf_service.dart';

class PdfPreviewScreen extends StatelessWidget {
  const PdfPreviewScreen({super.key, required this.report});

  final Report report;

  @override
  Widget build(BuildContext context) {
    final service = PdfService();
    return Scaffold(
      appBar: AppBar(title: const Text('PDF確認')),
      body: PdfPreview(
        build: (_) => service.buildReportPdf(report),
        canChangeOrientation: false,
        canChangePageFormat: false,
        pdfFileName: '${report.title}.pdf',
      ),
    );
  }
}
