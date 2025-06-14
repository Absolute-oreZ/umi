import { useState, useEffect } from "react";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { customFetch } from "../../../api/fetchInstance";
import { countryData, learningStyles, mbtiTypes } from "../../../constants";
import { EditProfileSkeleton } from "../../../skeletons";
import PersonalityTypeCard from "../../../components/profile/PersonalityTypeCard";
import LearningStyleCard from "../../../components/profile/LearningStyleCard";
import Uploader from "../../../components/common/Uploader";
import { useAuth } from "../../../context/AuthContext";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, loading, fetchingUserData, fetchUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user && user.learningPreference) {
      setProfileData({
        username: user.username || "",
        country: user.learningPreference.country || "",
        personality: user.learningPreference.personality || "",
        learningStyles: user.learningPreference.learningStyles || [],
        profilePicture: null,
        profilePictureUrl: user.profilePicturePath || "",
      });
    }
  }, [user]);

  const handleUpdateField = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validations = [
      [!profileData.country, "Please select a country."],
      [!profileData.personality, "Please select a personality type."],
      [
        profileData.learningStyles.length === 0,
        "Please select at least one learning style.",
      ],
    ];

    const toastId = toast.loading("Saving new profile data");

    for (const [condition, message] of validations) {
      if (condition) {
        toast.update(toastId, {
          render: message,
          type: "error",
          isLoading: false,
          theme: "dark",
          position: "top-right",
          transition: Slide,
          autoClose: 3000,
        });
        return;
      }
    }

    try {
      setIsSaving(true);

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
        formData.append("profilePicture", profileData.profilePicture);
      }

      await customFetch("/users/update-profile", {
        method: "PATCH",
        body: formData,
      });

      await fetchUser();

      toast.update(toastId, {
        render: "Profile updated successfully!",
        type: "success",
        isLoading: false,
        theme: "dark",
        transition: Slide,
        autoClose: 3000,
      });

      navigate("/me");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.update(toastId, {
        render: "Something went wrong while updating.",
        type: "error",
        isLoading: false,
        theme: "dark",
        transition: Slide,
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const introvertTypes = mbtiTypes.filter((type) => type.value.startsWith("I"));
  const extrovertTypes = mbtiTypes.filter((type) => type.value.startsWith("E"));

  if (loading || fetchingUserData || !profileData) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="w-full text-white">
      <div className="container mx-auto p-20">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto backdrop-filter backdrop-blur-md rounded-lg p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                <div className="flex items-center">
                  <Uploader
                    initialImage={profileData.profilePictureUrl}
                    onImageSelected={(file) =>
                      handleUpdateField("profilePicture", file)
                    }
                  />
                  <div className="ml-4">
                    <p className="text-sm text-gray-300">
                      Upload a new profile picture
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div>
                <h2 className="text-xl font-semibold mb-4 mt-8">Username</h2>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    handleUpdateField("username", e.target.value)
                  }
                  placeholder="Enter your username"
                  className="w-full p-3 bg-opacity-20 bg-black backdrop-filter backdrop-blur-md text-white border border-gray-600 rounded-lg"
                  required
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Country</h2>
                <select
                  value={profileData.country}
                  onChange={(e) => handleUpdateField("country", e.target.value)}
                  className="w-full p-3 bg-opacity-20 bg-black backdrop-filter backdrop-blur-md text-white border border-gray-600 rounded-lg"
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {Object.entries(countryData).map(([continent, countries]) => (
                    <optgroup label={continent} key={continent}>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {String.fromCodePoint(
                            ...country.code
                              .split("")
                              .map((c) => c.charCodeAt(0) + 127397)
                          )}{" "}
                          {country.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Personality Type</h2>
                <div className="flex flex-col gap-4">
                  <div className="mb-2">
                    <h3 className="font-medium mb-2">Introvert Types</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto hide-scrollbar pr-1">
                      {introvertTypes.map((type) => (
                        <PersonalityTypeCard
                          key={type.value}
                          type={type}
                          isSelected={profileData.personality === type.value}
                          onSelect={(value) =>
                            handleUpdateField("personality", value)
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="font-medium mb-2">Extrovert Types</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto hide-scrollbar pr-1">
                      {extrovertTypes.map((type) => (
                        <PersonalityTypeCard
                          key={type.value}
                          type={type}
                          isSelected={profileData.personality === type.value}
                          onSelect={(value) =>
                            handleUpdateField("personality", value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {profileData.personality && (
                  <div className="mt-2 bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-2">
                    <p className="text-white text-center">
                      Selected Personality:{" "}
                      <span className="font-bold">
                        {profileData.personality}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Learning Styles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto hide-scrollbar pr-2">
                {learningStyles.map((style) => (
                  <LearningStyleCard
                    key={style.value}
                    style={style}
                    isSelected={profileData.learningStyles.includes(
                      style.value
                    )}
                    onToggle={() =>
                      handleUpdateField(
                        "learningStyles",
                        profileData.learningStyles.includes(style.value)
                          ? profileData.learningStyles.filter(
                              (s) => s !== style.value
                            )
                          : [...profileData.learningStyles, style.value]
                      )
                    }
                  />
                ))}
              </div>
              {profileData.learningStyles?.length > 0 && (
                <div className="flex w-full mt-2 bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-2">
                  <p className="text-white text-center w-full">
                    Selected Learning Styles:{" "}
                    <span className="font-bold w-full">
                      {profileData.learningStyles.join(", ")}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/me")}
              className="px-6 py-3 rounded-lg text-white mr-4 bg-opacity-20 bg-black backdrop-filter backdrop-blur-md hover:bg-opacity-30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
              disabled={isSaving}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
