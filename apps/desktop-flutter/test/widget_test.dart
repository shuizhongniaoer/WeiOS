import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';

import 'package:desktop_flutter/main.dart';

void main() {
  testWidgets('WeiOS dashboard renders core sections', (tester) async {
    tester.view.physicalSize = const Size(1440, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const WeiOsApp());

    expect(find.text('私人 AI 控制中心'), findsOneWidget);
    expect(find.text('今天最重要的 3 件事'), findsOneWidget);
    expect(find.text('Project Hub'), findsOneWidget);
    expect(find.text('Permission First'), findsOneWidget);
  });
}
