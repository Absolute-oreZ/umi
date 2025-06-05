import React from "react";

const Stepper = ({ currentStep, totalSteps }) => {
  return (
    <div className="fixed top-8 left-0 right-0 flex justify-center z-10">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                step === currentStep 
                  ? "bg-white text-indigo-700 font-bold"
                  : step < currentStep 
                    ? "bg-indigo-200 text-indigo-700" 
                    : "bg-white bg-opacity-30 text-white"
              }`}
            >
              {step < currentStep ? "✓" : step}
            </div>
            {step < totalSteps && (
              <div className={`w-8 h-1 ${step < currentStep ? "bg-indigo-200" : "bg-white bg-opacity-30"}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;