import React from "react";

const GroupsSkeleton = () => {
  return (
    <div className="flex flex-1 w-full min-h-screen animate-pulse">
      <div className="flex flex-col gap-4 border-r-1 border-black w-2/7 min-h-screen p-4">
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-gray-700 rounded-md" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-700 rounded-full" />
            <div className="h-8 w-8 bg-gray-700 rounded-full" />
          </div>
        </div>

        <div className="relative">
          <div className="h-10 bg-gray-700 rounded-md w-full" />
          <div className="absolute left-3 inset-y-0 flex items-center">
            <div className="h-5 w-5 bg-gray-600 rounded-full" />
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center p-2 rounded-md bg-gray-800">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="ml-3 flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-screen w-full flex justify-center items-center text-center flex-col bg-gray-800">
        <div className="w-32 h-32 bg-gray-700 rounded-md" />
        <div className="h-4 w-32 bg-gray-700 rounded mt-4" />
      </div>
    </div>
  );
};

export default GroupsSkeleton;