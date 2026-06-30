import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../routes/app_routes.dart';
import '../../utils/constants.dart';
import '../../widgets/primary_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _goHome(Future<void> Function() action) async {
    await action();
    if (mounted) Navigator.pushReplacementNamed(context, AppRoutes.home);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 36),
            const Icon(Icons.business, size: 64, color: AppColors.primary),
            const SizedBox(height: 16),
            const Text(AppConstants.appName, textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            TextField(controller: _email, decoration: const InputDecoration(labelText: 'メールアドレス')),
            const SizedBox(height: 12),
            TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'パスワード')),
            const SizedBox(height: 20),
            PrimaryButton(
              label: 'ログイン',
              icon: Icons.login,
              onPressed: () => _goHome(() => ref.read(authProvider.notifier).signIn(_email.text, _password.text)),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'ログインせず利用',
              icon: Icons.person_outline,
              filled: false,
              onPressed: () => _goHome(ref.read(authProvider.notifier).continueAsGuest),
            ),
          ],
        ),
      ),
    );
  }
}
