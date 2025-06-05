import { countryData } from "../../../constants/countryData";
import ProfileCompletionLayout from "./ProfileCompletionLayout";
import Uploader from "../../../components/common/Uploader";
import {getFlagEmoji} from "../../../utils";
import { toast,Slide } from "react-toastify";

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
          onImageSelected={(file) => onUpdateField('profilePicture', file)} 
        />
      </div>

      <div>
        <label className="block text-white text-sm font-bold mb-2">
          Country
        </label>
        <select
          value={country}
          onChange={(e) => onUpdateField('country', e.target.value)}
          className="w-full p-2 text-black rounded"
        >
          <option value="" disabled>
            Select a country
          </option>
          {Object.entries(countryData).map(([continent, countries]) => (
            <optgroup label={continent} key={continent}>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {getFlagEmoji(country.code)} {country.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </ProfileCompletionLayout>
  );
};

export default CountryStep;