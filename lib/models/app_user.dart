class AppUser {
  const AppUser({
    required this.userId,
    required this.name,
    required this.email,
    required this.branchId,
    required this.branchName,
    this.role = 'worker',
    this.isActive = true,
  });

  final String userId;
  final String name;
  final String email;
  final String branchId;
  final String branchName;
  final String role;
  final bool isActive;

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'name': name,
        'email': email,
        'branchId': branchId,
        'branchName': branchName,
        'role': role,
        'isActive': isActive,
      };

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        userId: json['userId'] as String,
        name: json['name'] as String,
        email: json['email'] as String? ?? '',
        branchId: json['branchId'] as String? ?? '',
        branchName: json['branchName'] as String? ?? '',
        role: json['role'] as String? ?? 'worker',
        isActive: json['isActive'] as bool? ?? true,
      );
}
