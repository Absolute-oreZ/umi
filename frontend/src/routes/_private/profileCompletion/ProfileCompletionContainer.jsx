import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast,Slide } from "react-toastify";
import axiosInstance from "../../../api/axiosInstance";
import useProfileCompletionState from "../../../hooks/userProfileCompletionState";
import CountryStep from "./CountryStep";
import PersonalityStep from "./PersonalityStep";
import LearningStylesStep from "./LearningStylesStep";
import Stepper from "../../../components/common/Stepper";
import BackButton from "../../../components/common/BackButton";
import {useAuth} from "../../../context/AuthContext"

const ProfileCompletionContainer = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
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
      1: "linear-gradient(to bottom, #7EC8E3, #3BAFDA)", // Surface - bright sky blue to medium aqua
      2: "linear-gradient(to bottom, #3BAFDA, #1F6F8B)", // Mid-depth - aqua to deeper blue
      3: "linear-gradient(to bottom, #1F6F8B, #0B3C5D)", // Deep sea - dark blue to almost navy
    };

    container.style.background =
      gradients[step] || "linear-gradient(to bottom, #4C6BFF, #29259D)";
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitProfileData = async (learningPreferenceDTO) => {
    return await axiosInstance.put(
      "/learners/update-learning-preference",
      learningPreferenceDTO
    );
  };

  const uploadProfilePicture = async (pictureFile) => {
    const formData = new FormData();
    formData.append("profilePicture", pictureFile);

    return await axiosInstance.post(
      "/learners/upload-profile-picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  const handleSubmit = async () => {
    if (currentStep !== 3) return;

    setIsSubmitting(true);

    try {
      const learningPreferenceDTO = {
        country: profileData.country,
        personality: profileData.personality,
        learningStyles: profileData.learningStyles,
      };

      await submitProfileData(learningPreferenceDTO);

      if (profileData.profilePicture) {
        await uploadProfilePicture(profileData.profilePicture);
      }


      await fetchUser();
      navigate("/me");
    } catch (error) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CountryStep
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

  return (
    <div className="bubbles-container">
      <div className="bubbles">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="bubble" />
        ))}
      </div>

      <Stepper currentStep={currentStep} totalSteps={3} />

      {currentStep > 1 && <BackButton onClick={handlePrevious} />}

      <div className="content-container">{renderCurrentStep()}</div>
    </div>
  );
};

export default ProfileCompletionContainer;
