const EventsSkeleton = () => {
  return (
    <div className="w-full text-white p-6 animate-pulse">
      <div className="flex flex-col border border-dark-100 rounded-md h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="py-3 px-4 flex items-center justify-between bg-gray-700 border-b border-dark-100 rounded-t-md">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-600 rounded-full" />
            <div className="h-6 w-24 bg-gray-600 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full" />
            <div className="w-8 h-8 bg-gray-600 rounded-full" />
            <div className="w-32 h-8 bg-gray-600 rounded-full" />
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Only Left Panel - Groups */}
          <div className="w-[25%] overflow-y-auto bg-gray-800 border-r border-dark-100">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 flex items-center gap-3 border-b border-dark-100"
              >
                <div className="w-5 h-5 bg-gray-600 rounded-full" />
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
              </div>
            ))}
          </div>

          <div className="w-[75%] bg-gray-900" />
        </div>
      </div>
    </div>
  );
};

export default EventsSkeleton;
