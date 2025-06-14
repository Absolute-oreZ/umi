import { learningStyles } from "../../../constants/learningStyles";
import LearningStyleCard from "../../../components/profile/LearningStyleCard";
import { toast, Slide } from "react-toastify";
import Loader from "../../../components/common/Loader";

const LearningStylesStep = ({
  learningStyles: selectedStyles = [],
  onUpdateField,
  onSubmit,
  isSubmitting,
}) => {
  const toggleStyle = (style) => {
    let updatedStyles;
    if (selectedStyles.includes(style)) {
      updatedStyles = selectedStyles.filter((s) => s !== style);
    } else {
      updatedStyles = [...selectedStyles, style];
    }
    onUpdateField("learningStyles", updatedStyles);
  };

  const handleSubmit = () => {
    if (selectedStyles.length === 0) {
      toast.error("Please select at least one learning style.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      return;
    }

    onSubmit();
  };

  return (
    <div className="flex flex-col gap-8 justify-center items-center w-full text-white p-3">
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <h2 className="font-extrabold text-3xl mt-20">
          What are your preferred learning styles?
        </h2>
        <p className="text-lg">
          Select all that apply. These help us tailor content to your
          preferences.
        </p>
      </div>

      <div className="w-full max-w-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto hide-scrollbar p-1">
          {learningStyles.map((style) => (
            <LearningStyleCard
              key={style.value}
              style={style}
              isSelected={selectedStyles.includes(style.value)}
              onToggle={() => toggleStyle(style.value)}
            />
          ))}
        </div>

        <button
          disabled={isSubmitting}
          className={`w-full py-3 rounded text-white font-bold text-lg mt-4 flex items-center justify-center ${
            isSubmitting ? "bg-gray-500" : "bg-[#4C6BFF]"
          }`}
          onClick={handleSubmit}
        >
          {isSubmitting ? <Loader size={20} text="Completing your profile" /> : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default LearningStylesStep;
