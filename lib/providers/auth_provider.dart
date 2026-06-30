import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/app_user.dart';
import '../repositories/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepository());

final authProvider = StateNotifierProvider<AuthNotifier, AppUser?>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AppUser?> {
  AuthNotifier(this._repository) : super(null);

  final AuthRepository _repository;

  Future<void> signIn(String email, String password) async {
    state = await _repository.signIn(email: email, password: password);
  }

  Future<void> continueAsGuest() async {
    state = await _repository.continueAsGuest();
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = null;
  }
}
