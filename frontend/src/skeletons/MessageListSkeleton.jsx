const MessageListSkeleton = () => {
  return (
    <div className="flex flex-col w-full h-full p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 w-40 bg-gray-700 rounded mb-2" />
          <div className="h-3 w-32 bg-gray-800 rounded" />
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <div className="max-w-[70%]">
            <div className="h-6 w-48 bg-gray-700 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl mb-1" />
            <div className="h-3 w-16 bg-gray-800 rounded ml-auto" />
          </div>
        </div>
        
        <div className="flex items-start justify-end gap-2">
          <div className="max-w-[70%]">
            <div className="h-6 w-36 bg-blue-600 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl mb-1" />
            <div className="h-3 w-16 bg-blue-800 rounded mr-auto" />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600" />
        </div>
        
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <div className="max-w-[70%]">
            <div className="h-40 w-60 bg-gray-700 rounded-2xl mb-1" />
            <div className="h-3 w-16 bg-gray-800 rounded ml-auto" />
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <div className="max-w-[70%]">
            <div className="h-4 w-56 bg-gray-700 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl mb-1" />
            <div className="h-4 w-48 bg-gray-700 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl mb-1" />
            <div className="h-3 w-16 bg-gray-800 rounded ml-auto" />
          </div>
        </div>
        
        <div className="flex items-start justify-end gap-2">
          <div className="max-w-[70%]">
            <div className="h-4 w-40 bg-blue-600 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl mb-1" />
            <div className="h-4 w-32 bg-blue-600 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl mb-1" />
            <div className="h-3 w-16 bg-blue-800 rounded mr-auto" />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600" />
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="h-12 bg-gray-800 rounded-full" />
      </div>
    </div>
  );
};

export default MessageListSkeleton;