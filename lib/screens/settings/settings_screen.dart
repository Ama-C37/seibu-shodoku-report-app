import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('設定')),
      body: const ListView(
        padding: EdgeInsets.all(16),
        children: [
          ListTile(
            leading: Icon(Icons.key),
            title: Text('OpenAI APIキー'),
            subtitle: Text('MVPでは未接続。Firebase Functions等で管理してください。'),
          ),
          ListTile(
            leading: Icon(Icons.cloud),
            title: Text('Firebase連携'),
            subtitle: Text('Repository層をFirebase実装に差し替える構成です。'),
          ),
        ],
      ),
    );
  }
}
