const ResourcePageSkeleton = () => {
  return (
    <div className="min-h-screen p-6 font-sans flex justify-center animate-pulse">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-10">
        <div className="flex-1 p-6 flex flex-col justify-start">
          <div className="flex items-center justify-center mb-6 space-x-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full" />
            <div className="h-6 w-48 bg-gray-700 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 my-6">
            <div className="w-full sm:flex-grow h-12 bg-gray-800 rounded" />
            <div className="h-12 w-32 bg-gray-700 rounded" />
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="h-8 w-20 bg-gray-700 rounded-full"
              />
            ))}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border-b border-gray-700 rounded-md bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-600 rounded" />
                    <div className="h-3 w-24 bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="h-3 w-20 bg-gray-600 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col space-y-6">
          <div className="h-6 w-1/2 bg-gray-600 rounded" />

          <div className="h-40 bg-gray-700 border-2 border-dashed rounded-md" />

          <div className="h-12 bg-gray-600 rounded" />

          <div className="h-4 w-3/4 bg-gray-500 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default ResourcePageSkeleton;
