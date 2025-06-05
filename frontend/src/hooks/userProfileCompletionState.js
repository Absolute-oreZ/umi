import { useState } from "react";

export default function userProfileCompletionState(){
    const [profileData, setProfileData] = useState({
        country: "",
        profilePicture: null,
        personality: "",
        learningStyles: [],
      });
    
      const updateProfileData = (field, value) => {
        setProfileData(prev => ({
          ...prev,
          [field]: value
        }));
      };
    
      const updateMultipleFields = (newData) => {
        setProfileData(prev => ({
          ...prev,
          ...newData
        }));
      };
    
      return {
        profileData,
        updateProfileData,
        updateMultipleFields
      };
}
