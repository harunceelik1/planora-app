import { NextResponse } from 'next/server';
import { listIssueActivities } from '@/actions/issue-activity';

export async function GET(_req: Request, { params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params;
  if (!issueId) return NextResponse.json({ error: 'missing_issueId' }, { status: 400 });

  try {
    const activities = await listIssueActivities(issueId, 200);
    return NextResponse.json({ success: true, data: activities });
  } catch (err) {
    console.error('Failed to list activities', err);
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 });
  }
}
