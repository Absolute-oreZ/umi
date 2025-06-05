import { learningStyles } from "../../../constants/learningStyles";
import ProfileCompletionLayout from "./ProfileCompletionLayout";
import LearningStyleCard from "../../../components/profile/LearningStyleCard";
import { toast } from "react-toastify";

const LearningStylesStep = ({
  learningStyles: selectedStyles = [],
  onUpdateField,
  onSubmit,
  isSubmitting,
}) => {
  const handleToggleStyle = (styleValue) => {
    const updatedStyles = selectedStyles.includes(styleValue)
      ? selectedStyles.filter((style) => style !== styleValue)
      : [...selectedStyles, styleValue];

    onUpdateField("learningStyles", updatedStyles);
  };

  const handleComplete = () => {
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
    <ProfileCompletionLayout
      title="How do you learn best?"
      description="Select the learning styles that work best for you. This helps us tailor your learning experience."
      onContinue={handleComplete}
      buttonText="Complete Profile"
      isLoading={isSubmitting}
    >
      <div className="flex flex-col w-full items-center relative">
        <label className="block text-white text-sm font-bold mb-2 text-center">
          Select Your Learning Styles
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1 mx-auto">
          {learningStyles.map((style) => (
            <LearningStyleCard
              key={style.value}
              style={style}
              isSelected={selectedStyles.includes(style.value)}
              onToggle={() => handleToggleStyle(style.value)}
            />
          ))}
        </div>

        <p className="text-xs mt-3 text-center text-gray-200">
          Selected styles:{" "}
          <span className="font-medium">{selectedStyles.length}</span>
        </p>
        <p className="text-center text-sm mt-2">
          Not sure about your learning style? Take a test{" "}
          <a
            className="text-red-600 hover:text-red-800 underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://vark-learn.com/the-vark-questionnaire/"
          >
            here
          </a>
        </p>
      </div>
    </ProfileCompletionLayout>
  );
};

export default LearningStylesStep;
