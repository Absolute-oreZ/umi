const PersonalityTypeCard = ({ type, isSelected, onSelect }) => {
  const getPersonalityTheme = (code) => {
    const firstLetter = code.charAt(0);
    switch (firstLetter) {
      case "I":
        return "from-blue-400 to-blue-600";
      case "E":
        return "from-orange-400 to-orange-600";
      default:
        return "from-purple-400 to-purple-600";
    }
  };

  const gradientClass = getPersonalityTheme(type.value);

  return (
    <div
      className={`h-20 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 transform group relative ${
        isSelected ? "ring-1 ring-white scale-102" : "hover:scale-102"
      }`}
      onClick={() => onSelect(type.value)}
    >
      <div className={`bg-gradient-to-br ${gradientClass} p-7 text-white`}>
        <h3 className="text-xl font-bold">{type.value}</h3>
        <p className="text-sm opacity-90">{type.label}</p>
      </div>

      {/* Traits shown on hover */}
      <div className="absolute inset-0 bg-black bg-opacity-80 text-white p-4 text-xs flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ul className="list-disc text-left">
          {type.traits.map((trait, idx) => (
            <li className="list-none" key={idx}>
              {trait}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalityTypeCard;
