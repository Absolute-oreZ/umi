const LearningStyleCard = ({ style, isSelected, onToggle }) => {
  const getStyleIcon = (styleType) => {
    switch (styleType) {
      case "visual":
        return "👁️";
      case "auditory":
        return "👂";
      case "reading_writing":
        return "📚";
      case "kinesthetic":
        return "✋";
      default:
        return "❓";
    }
  };

  return (
    <div
      onClick={onToggle}
      className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 flex flex-col ${
        isSelected
          ? "bg-indigo-600 text-white"
          : "bg-white bg-opacity-10 hover:bg-opacity-20 text-dark-100"
      }`}
    >
      {/* Top: icon + label */}
      <div className="flex items-center mb-2">
        <span className="mr-3 text-2xl">{getStyleIcon(style.value)}</span>
        <span className="font-bold">{style.label}</span>
      </div>

      {/* Description */}
      <div className="text-sm opacity-80">{style.description}</div>

      {/* Bottom-right circle */}
      <div className="absolute bottom-2 right-2">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected ? "border-white bg-indigo-500" : "border-gray-300"
          }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningStyleCard;
