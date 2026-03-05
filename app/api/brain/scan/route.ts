import { NextResponse } from 'next/server';
import { GameBrain } from '@/lib/brain/GameBrain';

export async function POST(req: Request) {
  const { targetDir, tenantId } = await req.json();
  const brain = new GameBrain(tenantId);
  await brain.init(targetDir);
  return NextResponse.json({ stats: brain.getStats() });
}
