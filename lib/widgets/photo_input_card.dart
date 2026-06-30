import 'dart:io';

import 'package:flutter/material.dart';

import '../models/report_photo.dart';

class PhotoInputCard extends StatelessWidget {
  const PhotoInputCard({
    super.key,
    required this.photo,
    required this.onDescriptionChanged,
    required this.onDelete,
  });

  final ReportPhoto photo;
  final ValueChanged<String> onDescriptionChanged;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.file(File(photo.imageUrl), fit: BoxFit.cover),
            ),
            const SizedBox(height: 12),
            TextFormField(
              initialValue: photo.description,
              decoration: const InputDecoration(labelText: '写真説明'),
              onChanged: onDescriptionChanged,
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline),
                label: const Text('削除'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
