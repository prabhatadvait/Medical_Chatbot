import MessageAnimation from './MessageAnimation';
import { marked } from 'marked';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Convert markdown to HTML
  const createMarkup = () => {
    return { __html: marked(content) };
  };

  return (
    <MessageAnimation role={role}>
      <div className={`py-6 ${role === 'assistant' ? 'bg-white dark:bg-gray-800' : ''}`}>
        <div className="max-w-3xl mx-auto px-4">
          <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-4 ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-teal-600 text-white'
              }`}>
                {role === 'user' ? 'U' : 'AI'}
              </div>

              {/* Message content */}
              <div className={`flex-1 space-y-2 overflow-hidden ${
                role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {/* Timestamp */}
                <div className={`text-xs text-gray-500 dark:text-gray-400 ${
                  role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(timestamp)}
                </div>

                <div className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                  role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div 
                    className="whitespace-pre-wrap text-sm sm:text-base prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={createMarkup()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MessageAnimation>
  );
}
