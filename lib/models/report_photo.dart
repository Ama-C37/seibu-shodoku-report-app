class ReportPhoto {
  const ReportPhoto({
    required this.photoId,
    required this.reportId,
    required this.imageUrl,
    this.thumbnailUrl,
    required this.description,
    required this.sortOrder,
    this.takenAt,
    this.latitude,
    this.longitude,
    required this.createdAt,
  });

  final String photoId;
  final String reportId;
  final String imageUrl;
  final String? thumbnailUrl;
  final String description;
  final int sortOrder;
  final DateTime? takenAt;
  final double? latitude;
  final double? longitude;
  final DateTime createdAt;

  ReportPhoto copyWith({String? description, int? sortOrder}) => ReportPhoto(
        photoId: photoId,
        reportId: reportId,
        imageUrl: imageUrl,
        thumbnailUrl: thumbnailUrl,
        description: description ?? this.description,
        sortOrder: sortOrder ?? this.sortOrder,
        takenAt: takenAt,
        latitude: latitude,
        longitude: longitude,
        createdAt: createdAt,
      );

  Map<String, dynamic> toJson() => {
        'photoId': photoId,
        'reportId': reportId,
        'imageUrl': imageUrl,
        'thumbnailUrl': thumbnailUrl,
        'description': description,
        'sortOrder': sortOrder,
        'takenAt': takenAt?.toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
        'createdAt': createdAt.toIso8601String(),
      };

  factory ReportPhoto.fromJson(Map<String, dynamic> json) => ReportPhoto(
        photoId: json['photoId'] as String,
        reportId: json['reportId'] as String,
        imageUrl: json['imageUrl'] as String,
        thumbnailUrl: json['thumbnailUrl'] as String?,
        description: json['description'] as String? ?? '',
        sortOrder: json['sortOrder'] as int? ?? 0,
        takenAt: json['takenAt'] == null ? null : DateTime.parse(json['takenAt'] as String),
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}
