import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../models/report_photo.dart';
import '../../providers/photo_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/photo_input_card.dart';

class PhotoManagerArgs {
  const PhotoManagerArgs({required this.reportId, required this.photos});

  final String reportId;
  final List<ReportPhoto> photos;
}

class PhotoManagerScreen extends ConsumerStatefulWidget {
  const PhotoManagerScreen({super.key, required this.args});

  final PhotoManagerArgs args;

  @override
  ConsumerState<PhotoManagerScreen> createState() => _PhotoManagerScreenState();
}

class _PhotoManagerScreenState extends ConsumerState<PhotoManagerScreen> {
  late List<ReportPhoto> _photos;

  @override
  void initState() {
    super.initState();
    _photos = [...widget.args.photos];
  }

  Future<void> _addPhoto(bool camera) async {
    try {
      final picker = ref.read(imageServiceProvider);
      final file = camera ? await picker.pickFromCamera() : await picker.pickFromGallery();
      if (file == null) return;
      setState(() {
        _photos.add(ReportPhoto(
          photoId: const Uuid().v4(),
          reportId: widget.args.reportId,
          imageUrl: file.path,
          description: '',
          sortOrder: _photos.length + 1,
          createdAt: DateTime.now(),
        ));
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(AppConstants.photoError)));
      }
    }
  }

  void _finish() {
    Navigator.pop(context, [
      for (var i = 0; i < _photos.length; i++) _photos[i].copyWith(sortOrder: i + 1),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('写真管理'),
        actions: [TextButton(onPressed: _finish, child: const Text('完了'))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(child: OutlinedButton.icon(onPressed: () => _addPhoto(true), icon: const Icon(Icons.photo_camera), label: const Text('カメラ'))),
              const SizedBox(width: 8),
              Expanded(child: OutlinedButton.icon(onPressed: () => _addPhoto(false), icon: const Icon(Icons.photo_library), label: const Text('ライブラリ'))),
            ],
          ),
          const SizedBox(height: 12),
          ReorderableListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _photos.length,
            onReorder: (oldIndex, newIndex) {
              setState(() {
                if (newIndex > oldIndex) newIndex -= 1;
                final item = _photos.removeAt(oldIndex);
                _photos.insert(newIndex, item);
              });
            },
            itemBuilder: (context, index) {
              final photo = _photos[index];
              return PhotoInputCard(
                key: ValueKey(photo.photoId),
                photo: photo,
                onDescriptionChanged: (value) => _photos[index] = photo.copyWith(description: value),
                onDelete: () => setState(() => _photos.removeAt(index)),
              );
            },
          ),
        ],
      ),
    );
  }
}
