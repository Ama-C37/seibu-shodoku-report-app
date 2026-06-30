import 'package:intl/intl.dart';

class DateFormatter {
  static final _date = DateFormat('yyyy年M月d日', 'ja_JP');
  static final _dateTime = DateFormat('yyyy/MM/dd HH:mm', 'ja_JP');

  static String date(DateTime value) => _date.format(value);
  static String dateTime(DateTime value) => _dateTime.format(value);
}
