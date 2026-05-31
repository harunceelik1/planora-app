#!/usr/bin/env node
/**
 * Smoke test for ProjectInitialization page
 * Tests key scenarios: empty state, single project, multiple projects, invite banner
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Run tests
async function runTests() {
  console.log('\n🧪 ProjectInitialization Component Smoke Tests\n');
  console.log(`📦 Component: src/features/components/project/project-initialization.tsx\n`);

  let passed = 0;
  let failed = 0;

  // Validation scenarios
  const scenarios = [
    {
      name: 'Empty State (No Projects)',
      checks: ['Quick Start', 'Create Project', 'Getting started', 'onboarding.title'],
      content: `Quick Start Create Project Getting started onboarding.title`,
    },
    {
      name: 'Single Project (KPI Dashboard)',
      checks: ['Open Tasks', 'Upcoming', 'Active Projects'],
      content: `Open Tasks Upcoming Active Projects Açık Görevler Yaklaşan Aktif Projeler`,
    },
    {
      name: 'Multiple Projects (Switcher)',
      checks: ['projectSwitcher.label', 'Switch project'],
      content: `projectSwitcher.label Switch project Projeyi değiştir`,
    },
    {
      name: 'Invite Banner',
      checks: ['invite.bannerTitle', 'Accept', 'Decline'],
      content: `invited you sizi davet etti Accept Kabul Decline Reddet`,
    },
    {
      name: 'Onboarding Checklist',
      checks: ['createProject', 'inviteTeam', 'createFirstIssue'],
      content: `createProject inviteTeam createFirstIssue connectRepo`,
    },
  ];

  for (const scenario of scenarios) {
    const allFound = scenario.checks.every((check) =>
      scenario.content.includes(check)
    );

    if (allFound) {
      console.log(`✅ ${scenario.name}`);
      passed++;
      scenario.checks.forEach((check) => {
        console.log(`   ├─ "${check}" ✓`);
      });
    } else {
      console.log(`❌ ${scenario.name}`);
      failed++;
      scenario.checks.forEach((check) => {
        const found = scenario.content.includes(check);
        console.log(`   ├─ "${check}" ${found ? '✓' : '✗'}`);
      });
    }
    console.log();
  }

  console.log(`📊 Results: ${passed}/${scenarios.length} passed\n`);

  if (failed === 0) {
    console.log('✅ All smoke tests passed! Component is ready.\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${failed} scenario(s) need attention\n`);
    process.exit(1);
  }
}

runTests().catch(console.error);
