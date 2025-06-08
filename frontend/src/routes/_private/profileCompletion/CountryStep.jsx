import { countryData } from "../../../constants/countryData";
import ProfileCompletionLayout from "./ProfileCompletionLayout";
import Uploader from "../../../components/common/Uploader";
import { getFlagEmoji } from "../../../utils";
import { toast, Slide } from "react-toastify";
import Select from "react-select";

const CountryStep = ({ country, profilePicture, onUpdateField, onNext }) => {
  const handleContinue = () => {
    if (!country) {
      toast.error("Please select a country.", {
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

  // Transform countryData to React Select format
  const countryOptions = Object.entries(countryData).map(
    ([continent, countries]) => ({
      label: continent,
      options: countries.map((c) => ({
        value: c.name,
        label: `${getFlagEmoji(c.code)} ${c.name}`,
      })),
    })
  );

  return (
    <ProfileCompletionLayout
      title="Let's set up your profile."
      description="Tell us more about yourself so we can provide you a personalized experience tailored to your needs and preferences."
      onContinue={handleContinue}
    >
      <div>
        <label className="block text-white text-sm font-bold mb-2">
          Profile Picture
        </label>
        <Uploader
          initialImage={profilePicture}
          onImageSelected={(file) => onUpdateField("profilePicture", file)}
        />
      </div>

      <div className="mt-4">
        <label className="block text-white text-sm font-bold mb-2">
          Country
        </label>
        <Select
          className="text-black"
          options={countryOptions}
          value={
            country
              ? {
                  value: country,
                  label: `${country}`,
                }
              : null
          }
          onChange={(selected) => onUpdateField("country", selected?.value)}
          placeholder="Select a country"
          isSearchable
          maxMenuHeight={200} // limits dropdown height (~5 items)
          styles={{
            menu: (base) => ({ ...base, zIndex: 9999 }), // for proper layering
          }}
        />
      </div>
    </ProfileCompletionLayout>
  );
};

export default CountryStep;
