const SkeletonBlock = ({ height = "1rem", width = "100%" }) => (
  <div
    className="bg-gray-700 animate-pulse rounded"
    style={{ height, width }}
  />
);

const EventDetailsSkeleton = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Title */}
      <SkeletonBlock height="2rem" width="50%" />

      {/* Date and Location */}
      <SkeletonBlock height="1.2rem" width="30%" />
      <SkeletonBlock height="1.2rem" width="40%" />

      <hr className="border-dark-100" />

      {/* Description blocks */}
      <SkeletonBlock height="1.2rem" width="90%" />
      <SkeletonBlock height="1.2rem" width="85%" />
      <SkeletonBlock height="1.2rem" width="70%" />
      <SkeletonBlock height="1.2rem" width="60%" />
      <SkeletonBlock height="12rem" width="100%" />
    </div>
  );
};

export default EventDetailsSkeleton;
