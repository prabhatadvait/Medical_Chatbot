import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ChatMessage } from '@/models/ChatMessage';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await ChatMessage.deleteMany({ userId: session.user.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}
