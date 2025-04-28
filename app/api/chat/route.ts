import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let message, chatId, history;
    try {
      ({ message, chatId, history } = await req.json());
    } catch (jsonErr) {
      console.error('[JSON Parsing Error]', jsonErr);
      return NextResponse.json({ error: 'Failed to parse request JSON' }, { status: 500 });
    }

    // Call Ollama's local API with mistral:latest
    let ollamaRes;
    try {
      ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral:latest',
          prompt: message,
          stream: false
        })
      });
    } catch (ollamaErr) {
      console.error('[Ollama Fetch Error]', ollamaErr);
      return NextResponse.json({ error: 'Could not connect to Ollama. Is it running?' }, { status: 500 });
    }

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error('[Ollama API Error]', ollamaRes.status, errText);
      return NextResponse.json({ error: `Ollama error: ${ollamaRes.status} ${errText}` }, { status: 500 });
    }

    let data;
    try {
      data = await ollamaRes.json();
    } catch (jsonErr) {
      console.error('[Ollama JSON Error]', jsonErr);
      return NextResponse.json({ error: 'Failed to parse Ollama response' }, { status: 500 });
    }

    const response = data.response;
    if (!response) {
      console.error('[Ollama Missing Response]', data);
      return NextResponse.json({ error: 'Ollama did not return a response' }, { status: 500 });
    }

    await connectDB();

    const client = await clientPromise;
    const db = client.db('medical_chatbot');

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const aiMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    let chat;
    if (chatId) {
      try {
        // Add messages to existing chat
        await db.collection('chats').updateOne(
          { _id: new ObjectId(chatId), userEmail: session.user.email },
          {
            $push: { messages: { $each: [userMessage, aiMessage] } } as any,
            $set: {
              lastMessage: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              timestamp: new Date(),
            }
          }
        );
        chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
      } catch (dbErr) {
        console.error('[Database Error]', dbErr);
        return NextResponse.json({ error: 'Failed to update chat in database' }, { status: 500 });
      }
    } else {
      try {
        // Create new chat
        const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
        const result = await db.collection('chats').insertOne({
          userEmail: session.user.email,
          title,
          lastMessage: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          timestamp: new Date(),
          messages: [userMessage, aiMessage],
        });
        chat = await db.collection('chats').findOne({ _id: result.insertedId });
      } catch (dbErr) {
        console.error('[Database Error]', dbErr);
        return NextResponse.json({ error: 'Failed to create new chat in database' }, { status: 500 });
      }
    }

    return NextResponse.json({ response, chat });
  } catch (error) {
    console.error('[API Chat Error]', error);
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}
