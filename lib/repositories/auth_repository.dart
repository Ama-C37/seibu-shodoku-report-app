import '../models/app_user.dart';

class AuthRepository {
  AppUser? _currentUser;

  AppUser? get currentUser => _currentUser;

  Future<AppUser> signIn({required String email, required String password}) async {
    _currentUser = AppUser(
      userId: email,
      name: email.split('@').first,
      email: email,
      branchId: 'default',
      branchName: '本社',
    );
    return _currentUser!;
  }

  Future<AppUser> continueAsGuest() async {
    _currentUser = const AppUser(
      userId: 'guest',
      name: '未ログイン',
      email: '',
      branchId: '',
      branchName: '',
    );
    return _currentUser!;
  }

  Future<void> signOut() async {
    _currentUser = null;
  }
}
