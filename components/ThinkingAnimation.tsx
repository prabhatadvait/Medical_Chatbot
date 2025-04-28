export default function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
        AI
      </div>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
