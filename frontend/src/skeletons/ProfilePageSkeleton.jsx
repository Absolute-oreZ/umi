const ProfilePageSkeleton = () => {
  return (
    <div className="w-full text-white px-6 p-20 animate-pulse">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-lg py-6 flex flex-col items-center">
          <div className="w-30 h-30 rounded-full bg-gray-700 mb-4" />
          <div className="h-6 w-2/3 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
          <div className="h-10 w-full bg-gray-800 rounded" />
        </div>

        <div className="col-span-2 space-y-8">
          <div className="rounded-lg p-6">
            <div className="h-8 w-1/2 bg-gray-700 rounded mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-700 rounded w-4/6" />
            </div>
          </div>

          <div className="rounded-lg p-6">
            <div className="h-6 w-1/3 bg-gray-700 rounded mb-4" />
            <div className="h-8 w-40 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;