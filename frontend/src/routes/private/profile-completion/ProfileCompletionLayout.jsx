import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";
// import axiosInstance from "../../../api/axiosInstance";
import { customFetch } from "../../../api/fetchInstance";
import useProfileCompletionState from "../../../hooks/userProfileCompletionState";
import CountryStep from "./CountryStep";
import PersonalityStep from "./PersonalityStep";
import LearningStylesStep from "./LearningStylesStep";
import Stepper from "../../../components/common/Stepper";
import BackButton from "../../../components/profile/BackButton";
import { useAuth } from "../../../context/AuthContext";

const ProfileCompletionLayout = () => {
  const { user, fetchUser } = useAuth();
  const { profileData, updateProfileData, updateMultipleFields } =
    useProfileCompletionState();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    updateBackgroundGradient(currentStep);
  }, [currentStep]);

  const updateBackgroundGradient = (step) => {
    const container = document.querySelector(".bubbles-container");
    if (!container) return;

    const gradients = {
      1: "linear-gradient(to bottom, #7EC8E3, #3BAFDA)",
      2: "linear-gradient(to bottom, #3BAFDA, #1F6F8B)",
      3: "linear-gradient(to bottom, #1F6F8B, #0B3C5D)",
    };

    container.style.background =
      gradients[step] || "linear-gradient(to bottom, #4C6BFF, #29259D)";
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    console.log("back button clicked");
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (currentStep !== 3) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("learningPreferenceDTO.country", profileData.country);
      formData.append(
        "learningPreferenceDTO.personality",
        profileData.personality
      );

      profileData.learningStyles.forEach((style) => {
        formData.append("learningPreferenceDTO.learningStyles", style);
      });

      if (profileData.profilePicture) {
        formData.append("profilePicture", profileData.profilePicture); // note: no space in key name
      }

      await customFetch("/users/update-profile", {
        method: "PATCH",
        body: formData,
      });

      await fetchUser();
    } catch (error) {
      toast.error("Please select a personality type.", {
        position: "bottom-right",
        closeButton: true,
        autoClose: 3000,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CountryStep
            username={profileData.username}
            country={profileData.country}
            profilePicture={profileData.profilePicture}
            onUpdateField={updateProfileData}
            onUpdateMultiple={updateMultipleFields}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <PersonalityStep
            personality={profileData.personality}
            onUpdateField={updateProfileData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <LearningStylesStep
            learningStyles={profileData.learningStyles}
            onUpdateField={updateProfileData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  if (user?.learningPreference) {
    return <Navigate to="/me" />;
  }

  return (
    <div className="bubbles-container">
      <div className="bubbles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bubble" />
        ))}
      </div>

      <Stepper currentStep={currentStep} totalSteps={3} />

      {currentStep > 1 && <BackButton onClick={handlePrevious} />}

      <div className="content-container">{renderStepContent()}</div>
    </div>
  );
};

export default ProfileCompletionLayout;
