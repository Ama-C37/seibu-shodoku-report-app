import 'dart:io';
import 'dart:typed_data';

import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../models/report.dart';
import '../utils/constants.dart';
import '../utils/date_formatter.dart';

class PdfService {
  Future<Uint8List> buildReportPdf(Report report) async {
    final pdf = pw.Document();
    final font = await PdfGoogleFonts.notoSansJPRegular();
    final bold = await PdfGoogleFonts.notoSansJPBold();
    final theme = pw.ThemeData.withFont(base: font, bold: bold);

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        theme: theme,
        build: (_) => [
          pw.Text(report.title, style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 20),
          _row('報告書種別', ReportTypes.label(report.reportType)),
          _row('作業日', DateFormatter.date(report.workDate)),
          _row('作業場所', report.locationName),
          _row('住所', report.address),
          _row('報告者', report.reporterName),
          _row('所属支店', report.branchName),
          _row('GPS情報', _gpsText(report)),
          pw.SizedBox(height: 12),
          _section('報告内容', report.content),
          _section('備考', report.remarks),
        ],
      ),
    );

    if (report.photoType == PhotoTypes.withPhoto && report.photos.isNotEmpty) {
      for (var i = 0; i < report.photos.length; i += 4) {
        final photos = report.photos.skip(i).take(4).toList();
        pdf.addPage(
          pw.Page(
            pageFormat: PdfPageFormat.a4,
            theme: theme,
            build: (_) => pw.GridView(
              crossAxisCount: 2,
              childAspectRatio: 0.72,
              children: photos.map((photo) {
                final file = File(photo.imageUrl);
                return pw.Container(
                  padding: const pw.EdgeInsets.all(8),
                  decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey500)),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(photo.description.isEmpty ? '写真説明' : photo.description),
                      pw.SizedBox(height: 8),
                      if (file.existsSync())
                        pw.Expanded(child: pw.Image(pw.MemoryImage(file.readAsBytesSync()), fit: pw.BoxFit.contain))
                      else
                        pw.Expanded(child: pw.Center(child: pw.Text('画像を読み込めません'))),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        );
      }
    }

    return pdf.save();
  }

  Future<File> saveToFile(Report report) async {
    final bytes = await buildReportPdf(report);
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/${report.reportId}.pdf');
    return file.writeAsBytes(bytes);
  }

  pw.Widget _row(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(width: 90, child: pw.Text(label, style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
          pw.Expanded(child: pw.Text(value)),
        ],
      ),
    );
  }

  pw.Widget _section(String label, String value) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(label, style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
        pw.Container(
          width: double.infinity,
          margin: const pw.EdgeInsets.only(top: 6, bottom: 14),
          padding: const pw.EdgeInsets.all(10),
          decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey500)),
          child: pw.Text(value.isEmpty ? ' ' : value),
        ),
      ],
    );
  }

  String _gpsText(Report report) {
    if (report.latitude == null || report.longitude == null) return '未取得';
    return '${report.latitude}, ${report.longitude}';
  }
}
