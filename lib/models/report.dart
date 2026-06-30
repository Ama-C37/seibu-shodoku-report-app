import 'report_photo.dart';

class Report {
  const Report({
    required this.reportId,
    required this.reportType,
    required this.photoType,
    required this.title,
    required this.workDate,
    required this.locationName,
    required this.address,
    this.latitude,
    this.longitude,
    required this.reporterId,
    required this.reporterName,
    required this.branchId,
    required this.branchName,
    required this.content,
    required this.correctedContent,
    required this.remarks,
    required this.status,
    this.pdfUrl,
    required this.createdAt,
    required this.updatedAt,
    this.submittedAt,
    this.photos = const [],
  });

  final String reportId;
  final String reportType;
  final String photoType;
  final String title;
  final DateTime workDate;
  final String locationName;
  final String address;
  final double? latitude;
  final double? longitude;
  final String reporterId;
  final String reporterName;
  final String branchId;
  final String branchName;
  final String content;
  final String correctedContent;
  final String remarks;
  final String status;
  final String? pdfUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? submittedAt;
  final List<ReportPhoto> photos;

  Report copyWith({
    String? status,
    String? pdfUrl,
    DateTime? submittedAt,
    List<ReportPhoto>? photos,
  }) => Report(
        reportId: reportId,
        reportType: reportType,
        photoType: photoType,
        title: title,
        workDate: workDate,
        locationName: locationName,
        address: address,
        latitude: latitude,
        longitude: longitude,
        reporterId: reporterId,
        reporterName: reporterName,
        branchId: branchId,
        branchName: branchName,
        content: content,
        correctedContent: correctedContent,
        remarks: remarks,
        status: status ?? this.status,
        pdfUrl: pdfUrl ?? this.pdfUrl,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
        submittedAt: submittedAt ?? this.submittedAt,
        photos: photos ?? this.photos,
      );

  Map<String, dynamic> toJson() => {
        'reportId': reportId,
        'reportType': reportType,
        'photoType': photoType,
        'title': title,
        'workDate': workDate.toIso8601String(),
        'locationName': locationName,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'reporterId': reporterId,
        'reporterName': reporterName,
        'branchId': branchId,
        'branchName': branchName,
        'content': content,
        'correctedContent': correctedContent,
        'remarks': remarks,
        'status': status,
        'pdfUrl': pdfUrl,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'submittedAt': submittedAt?.toIso8601String(),
        'photos': photos.map((photo) => photo.toJson()).toList(),
      };

  factory Report.fromJson(Map<String, dynamic> json) => Report(
        reportId: json['reportId'] as String,
        reportType: json['reportType'] as String,
        photoType: json['photoType'] as String,
        title: json['title'] as String,
        workDate: DateTime.parse(json['workDate'] as String),
        locationName: json['locationName'] as String? ?? '',
        address: json['address'] as String? ?? '',
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        reporterId: json['reporterId'] as String? ?? '',
        reporterName: json['reporterName'] as String? ?? '',
        branchId: json['branchId'] as String? ?? '',
        branchName: json['branchName'] as String? ?? '',
        content: json['content'] as String? ?? '',
        correctedContent: json['correctedContent'] as String? ?? '',
        remarks: json['remarks'] as String? ?? '',
        status: json['status'] as String? ?? 'draft',
        pdfUrl: json['pdfUrl'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        submittedAt: json['submittedAt'] == null ? null : DateTime.parse(json['submittedAt'] as String),
        photos: ((json['photos'] as List<dynamic>?) ?? [])
            .map((item) => ReportPhoto.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}
