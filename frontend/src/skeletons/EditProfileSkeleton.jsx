import React from "react";

const EditProfileSkeleton = () => {
  return (
    <div className="w-full text-white px-6 p-20 animate-pulse">
      <div className="container mx-auto max-w-4xl backdrop-filter backdrop-blur-md rounded-lg p-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
              <div className="flex items-center">
                <div className="w-24 h-24 rounded-full bg-gray-700" />
                <div className="ml-4 space-y-2">
                  <div className="h-4 w-40 bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-700 rounded" />
                </div>
              </div>
            </div>

            <div>
              <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
              <div className="h-10 bg-gray-700 rounded w-full" />
            </div>

            <div>
              <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-700 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-800 rounded" />
                  ))}
                </div>
                <div className="h-4 w-32 bg-gray-700 rounded mt-4" />
                <div className="grid grid-cols-2 gap-2">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-800 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-10 bg-gray-800 rounded" />
              ))}
            </div>
            <div className="h-4 w-48 bg-gray-700 rounded mt-4" />
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <div className="h-10 w-24 bg-gray-700 rounded" />
          <div className="h-10 w-36 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export default EditProfileSkeleton;