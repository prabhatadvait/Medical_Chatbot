'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ChatSidebar from '@/components/ChatSidebar';
import ThinkingAnimation from '@/components/ThinkingAnimation';
import { FiLogOut, FiUser, FiTrash2, FiX } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

type Message = {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Chat = {
  _id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chat/history');
        if (!response.ok) throw new Error('Failed to fetch chat history');
        const data = await response.json();
        setChats(data.chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        })));
        
        // Set the most recent chat as active
        if (data.chats.length > 0 && !activeChatId) {
          setActiveChatId(data.chats[0]._id);
          setMessages(data.chats[0].messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    if (session?.user) {
      fetchChats();
    }
  }, [session, activeChatId]);

  // Handle new chat
  const handleNewChat = () => {
    setActiveChatId(undefined);
    setMessages([]);
  };

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chats.find(chat => chat._id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  };

  // Handle chat deletion
  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      setChats(prev => prev.filter(chat => chat._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(undefined);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      
      // Add user message to chat
      const userMessage: Message = { 
        role: 'user', 
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Show error message in chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) throw new Error('Failed to delete message');

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/chat/messages/clear', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to clear chat');

      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-800">
      {/* Chat Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Medical Assistant</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">|</span>
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    title="Clear chat history"
                  >
                    <FiTrash2 />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm"
                >
                  Home
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm"
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto pt-20 pb-32">
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl mb-6">
                  AI
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Welcome to Your Medical Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mb-8">
                  I'm here to provide general health information and guidance. Remember, I'm an AI assistant and cannot provide medical diagnosis. Always consult healthcare professionals for specific medical advice.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                  <button
                    onClick={() => handleSendMessage("What is a fever and when should I be concerned?")}
                    className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
                  >
                    <p className="font-medium text-gray-800 dark:text-white mb-1">About Fever</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Learn about fever symptoms and when to seek medical attention</p>
                  </button>
                  <button
                    onClick={() => handleSendMessage("What are common cold symptoms and how can I treat them?")}
                    className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
                  >
                    <p className="font-medium text-gray-800 dark:text-white mb-1">Common Cold</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Understanding cold symptoms and home remedies</p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message._id} className="relative group">
                    <ChatMessage
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                    {message._id && (
                      <button
                        onClick={() => handleDeleteMessage(message._id!)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Delete message"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {isLoading && <ThinkingAnimation />}
              </>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Chat input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
