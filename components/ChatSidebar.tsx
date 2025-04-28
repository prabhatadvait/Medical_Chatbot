'use client';

import { FiPlus, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

type Chat = {
  _id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
};

type ChatSidebarProps = {
  chats: Chat[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
};

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const router = useRouter();

  return (
    <div className="hidden md:flex md:flex-col md:w-[260px] bg-gray-900 h-screen">
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-3 w-full px-3 py-3 text-white hover:bg-gray-700/50 transition-colors duration-200"
      >
        <FiPlus className="w-5 h-5" />
        <span>New chat</span>
      </button>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto mt-4">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 ${
              activeChatId === chat._id ? 'bg-gray-700/50' : ''
            }`}
            onClick={() => onSelectChat(chat._id)}
          >
            <FiMessageSquare className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{chat.title}</p>
              <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat._id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded-md transition-opacity duration-200"
            >
              <FiTrash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
