import 'package:flutter/material.dart';

void main() {
  runApp(const WeiOsApp());
}

class WeiOsApp extends StatelessWidget {
  const WeiOsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'WeiOS',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF246B51),
          surface: const Color(0xFFF7F8F4),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const WeiOsHome(),
    );
  }
}

class WeiOsHome extends StatefulWidget {
  const WeiOsHome({super.key});

  @override
  State<WeiOsHome> createState() => _WeiOsHomeState();
}

class _WeiOsHomeState extends State<WeiOsHome> {
  int selectedIndex = 0;

  final pages = const [
    DashboardView(),
    PlaceholderView(title: 'Projects'),
    PlaceholderView(title: 'Memories'),
    PlaceholderView(title: 'Tasks'),
    PlaceholderView(title: 'AI Team'),
    PlaceholderView(title: 'Permissions'),
    PlaceholderView(title: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            backgroundColor: const Color(0xFF111815),
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.dashboard_outlined),
                selectedIcon: Icon(Icons.dashboard),
                label: Text('Dashboard'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.folder_outlined),
                selectedIcon: Icon(Icons.folder),
                label: Text('Projects'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.auto_stories_outlined),
                selectedIcon: Icon(Icons.auto_stories),
                label: Text('Memories'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.task_alt_outlined),
                selectedIcon: Icon(Icons.task_alt),
                label: Text('Tasks'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.hub_outlined),
                selectedIcon: Icon(Icons.hub),
                label: Text('AI Team'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.verified_user_outlined),
                selectedIcon: Icon(Icons.verified_user),
                label: Text('Permissions'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings),
                label: Text('Settings'),
              ),
            ],
            extended: MediaQuery.sizeOf(context).width > 1100,
            groupAlignment: -0.86,
            indicatorColor: const Color(0xFFD7F2DF),
            labelType: NavigationRailLabelType.none,
            minExtendedWidth: 220,
            onDestinationSelected: (index) {
              setState(() => selectedIndex = index);
            },
            selectedIconTheme: const IconThemeData(color: Color(0xFF143B25)),
            selectedIndex: selectedIndex,
            selectedLabelTextStyle: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
            unselectedIconTheme: const IconThemeData(color: Color(0xFFB8C6BE)),
            unselectedLabelTextStyle: const TextStyle(color: Color(0xFFB8C6BE)),
          ),
          Expanded(child: pages[selectedIndex]),
        ],
      ),
    );
  }
}

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width > 1000;

    return ColoredBox(
      color: const Color(0xFFF6F7F4),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1180),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Header(),
                  const SizedBox(height: 20),
                  const Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      StatTile(label: 'Active projects', value: '7'),
                      StatTile(label: 'Open risks', value: '2'),
                      StatTile(label: 'Pending approvals', value: '0'),
                      StatTile(label: 'Memory items', value: '2'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (isWide)
                    const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 2,
                          child: Panel(
                            title: '今天最重要的 3 件事',
                            trailing: 'AI Daily Focus',
                            child: FocusList(),
                          ),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: Panel(
                            title: '待确认动作',
                            trailing: 'Approval Queue',
                            child: EmptyApprovalState(),
                          ),
                        ),
                      ],
                    )
                  else
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Panel(
                          title: '今天最重要的 3 件事',
                          trailing: 'AI Daily Focus',
                          child: FocusList(),
                        ),
                        SizedBox(height: 16),
                        Panel(
                          title: '待确认动作',
                          trailing: 'Approval Queue',
                          child: EmptyApprovalState(),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  if (isWide)
                    const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          flex: 2,
                          child: Panel(
                            title: '项目状态',
                            trailing: 'Project Hub',
                            child: ProjectList(),
                          ),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: Panel(
                            title: 'AI Team',
                            trailing: 'Roles',
                            child: AgentList(),
                          ),
                        ),
                      ],
                    )
                  else
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Panel(
                          title: '项目状态',
                          trailing: 'Project Hub',
                          child: ProjectList(),
                        ),
                        SizedBox(height: 16),
                        Panel(
                          title: 'AI Team',
                          trailing: 'Roles',
                          child: AgentList(),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  const Panel(
                    title: 'Memory Import',
                    trailing: 'Manual Intake',
                    child: MemoryImportPreview(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class Header extends StatelessWidget {
  const Header({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      runSpacing: 12,
      children: [
        const SizedBox(
          width: 520,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TODAY',
                style: TextStyle(
                  color: Color(0xFF16845B),
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 6),
              Text(
                '私人 AI 控制中心',
                style: TextStyle(
                  color: Color(0xFF18201D),
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFB8DFC9)),
            borderRadius: BorderRadius.circular(20),
            color: const Color(0xFFE5F5ED),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: const Text(
            'Permission First',
            style: TextStyle(
              color: Color(0xFF16845B),
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({required this.label, required this.value, super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 92, minWidth: 210),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDFE5DF)),
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF66716B))),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class Panel extends StatelessWidget {
  const Panel({
    required this.title,
    required this.trailing,
    required this.child,
    super.key,
  });

  final Widget child;
  final String title;
  final String trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDFE5DF)),
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                trailing,
                style: const TextStyle(color: Color(0xFF66716B), fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class FocusList extends StatelessWidget {
  const FocusList({super.key});

  static const tasks = [
    FocusTask(
      'critical',
      '完成 WeiOS monorepo 初始化',
      '共享类型、API、文档、Web 和 Flutter 壳子先跑通。',
    ),
    FocusTask('high', '确认 Planfit Builder API 时间表', '把延期风险转成项目风险和行动项。'),
    FocusTask('high', '设计 Memory Summary 验收样例', '验证事实、任务、风险抽取的输入输出契约。'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: tasks
          .map(
            (task) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: DataRowBox(
                leading: PriorityPill(text: task.priority),
                title: task.title,
                subtitle: task.subtitle,
                trailing: const StatusPill(text: 'doing'),
              ),
            ),
          )
          .toList(),
    );
  }
}

class ProjectList extends StatelessWidget {
  const ProjectList({super.key});

  static const projects = [
    (
      '1',
      'WeiOS / KnowMe v2.0',
      'Project Hub + Memory Engine + AI Summary bootstrap.',
    ),
    ('2', 'Planfit', 'Builder API timeline risk needs confirmation.'),
    ('3', 'iTMS', 'Awaiting first project import.'),
    ('7', 'Investment Management', 'Analysis allowed. Trading blocked.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: projects
          .map(
            (project) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: DataRowBox(
                leading: RankPill(text: project.$1),
                title: project.$2,
                subtitle: project.$3,
                trailing: const StatusPill(text: 'active'),
              ),
            ),
          )
          .toList(),
    );
  }
}

class AgentList extends StatelessWidget {
  const AgentList({super.key});

  static const agents = [
    ('Planner', 'planner', 'openai / gpt-5'),
    ('Architect', 'architect', 'anthropic / claude'),
    ('Coder', 'coder', 'local / codex'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: agents
          .map(
            (agent) => Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFDFE5DF)),
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    agent.$1,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    agent.$2,
                    style: const TextStyle(color: Color(0xFF66716B)),
                  ),
                  Text(
                    agent.$3,
                    style: const TextStyle(
                      color: Color(0xFF66716B),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class MemoryImportPreview extends StatelessWidget {
  const MemoryImportPreview({super.key});

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width > 900;

    final editor = Container(
      constraints: const BoxConstraints(minHeight: 120),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDFE5DF)),
        borderRadius: BorderRadius.circular(8),
        color: const Color(0xFFFBFCFB),
      ),
      padding: const EdgeInsets.all(14),
      child: const Text(
        'Chris: Builder API 可能延期到 7 月底。需要确认新的时间表，并评估 Planfit 上线风险。',
        style: TextStyle(height: 1.45),
      ),
    );

    final summary = Container(
      constraints: const BoxConstraints(minHeight: 120, minWidth: 260),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFC9D8FF)),
        borderRadius: BorderRadius.circular(8),
        color: const Color(0xFFE8EFFF),
      ),
      padding: const EdgeInsets.all(14),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Summary Contract',
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: 8),
          Text(
            'facts: 1\n tasks: 1\n risks: 1\n suggested memories: 1',
            style: TextStyle(color: Color(0xFF66716B), height: 1.45),
          ),
        ],
      ),
    );

    if (!isWide) {
      return Column(children: [editor, const SizedBox(height: 14), summary]);
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: editor),
        const SizedBox(width: 14),
        summary,
      ],
    );
  }
}

class EmptyApprovalState extends StatelessWidget {
  const EmptyApprovalState({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 182),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: const Color(0xFFEEF3EE),
      ),
      padding: const EdgeInsets.all(18),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('暂无待确认', style: TextStyle(fontWeight: FontWeight.w800)),
          SizedBox(height: 8),
          Text(
            '红色动作默认拦截，黄色动作进入确认队列。',
            style: TextStyle(color: Color(0xFF66716B), height: 1.45),
          ),
        ],
      ),
    );
  }
}

class DataRowBox extends StatelessWidget {
  const DataRowBox({
    required this.leading,
    required this.title,
    required this.subtitle,
    required this.trailing,
    super.key,
  });

  final Widget leading;
  final String subtitle;
  final String title;
  final Widget trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDFE5DF)),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          leading,
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(color: Color(0xFF66716B), height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          trailing,
        ],
      ),
    );
  }
}

class PriorityPill extends StatelessWidget {
  const PriorityPill({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    final isCritical = text == 'critical';
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isCritical ? const Color(0xFFFFE9E7) : const Color(0xFFFFF3D7),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Text(
        text,
        style: TextStyle(
          color: isCritical ? const Color(0xFFB42318) : const Color(0xFFB26A00),
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class RankPill extends StatelessWidget {
  const RankPill({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFFEEF3EE),
      ),
      height: 28,
      width: 28,
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w800)),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFFE8EFFF),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFF2563EB),
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class PlaceholderView extends StatelessWidget {
  const PlaceholderView({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFFF6F7F4),
      child: Center(
        child: Panel(
          title: title,
          trailing: 'MVP',
          child: const Text(
            '下一步会接入 API 数据和具体工作流。',
            style: TextStyle(color: Color(0xFF66716B)),
          ),
        ),
      ),
    );
  }
}

class FocusTask {
  const FocusTask(this.priority, this.title, this.subtitle);

  final String priority;
  final String subtitle;
  final String title;
}
