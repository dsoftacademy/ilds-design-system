import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// Wraps a widget with MaterialApp + ILDS font setup for consistent golden rendering.
Widget goldenWrap(Widget child, {double width = 400, double height = 200}) {
  return MaterialApp(
    theme: ThemeData(fontFamily: 'Mulish'),
    debugShowCheckedModeBanner: false,
    home: Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SizedBox(
          width: width,
          height: height,
          child: child,
        ),
      ),
    ),
  );
}

/// Call in setUpAll() in every golden test file.
Future<void> loadIldsTestFonts() async {
  final fontLoader = FontLoader('Mulish')
    ..addFont(rootBundle.load('assets/fonts/Mulish/Mulish-Regular.ttf'))
    ..addFont(rootBundle.load('assets/fonts/Mulish/Mulish-Bold.ttf'));
  await fontLoader.load();
}

const goldenDir = '../goldens';
