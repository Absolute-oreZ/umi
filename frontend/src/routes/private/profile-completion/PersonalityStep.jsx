import { mbtiTypes } from "../../../constants/mbtiTypes";
import PersonalityTypeCard from "../../../components/profile/PersonalityTypeCard";
import { toast, Slide } from "react-toastify";

const PersonalityStep = ({ personality, onUpdateField, onNext }) => {
  const handleContinue = () => {
    if (!personality) {
      toast.error("Please select a personality type.", {
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

    onNext();
  };

  const introvertTypes = mbtiTypes.filter((type) => type.value.startsWith("I"));
  const extrovertTypes = mbtiTypes.filter((type) => type.value.startsWith("E"));

  return (
    <div className="flex flex-col gap-8 justify-center items-center w-full text-white p-3">
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <h2 className="font-extrabold text-3xl mt-20">What's your personality type?</h2>
        <p className="text-lg">
          Your personality influences how you learn. Select the type that best
          describes you.
        </p>
      </div>

      <div className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex w-full gap-5">
          <div className="mb-4 w-full h-full">
            <h3 className="font-semibold text-white mb-2">Introvert Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto hide-scrollbar p-1">
              {introvertTypes.map((type) => (
                <PersonalityTypeCard
                  key={type.value}
                  type={type}
                  isSelected={personality === type.value}
                  onSelect={(value) => onUpdateField("personality", value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-4 w-full">
            <h3 className="font-semibold text-white mb-2">Extrovert Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto hide-scrollbar pr-1">
              {extrovertTypes.map((type) => (
                <PersonalityTypeCard
                  key={type.value}
                  type={type}
                  isSelected={personality === type.value}
                  onSelect={(value) => onUpdateField("personality", value)}
                />
              ))}
            </div>
          </div>
        </div>

        {personality && (
          <div className="mt-2 bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg">
            <p className="text-white text-center">
              Selected: <span className="font-bold">{personality}</span>
            </p>
          </div>
        )}

        <p className="text-center">
          Not sure about your personality type? Take a test{" "}
          <a
            className="text-red-600 hover:text-red-800"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.16personalities.com/free-personality-test"
          >
            here
          </a>
        </p>

        <button
          className="bg-[#4C6BFF] w-full py-3 rounded text-white font-bold text-lg mt-4"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PersonalityStep;
