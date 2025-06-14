import { countryData } from "../../../constants/countryData";
import Uploader from "../../../components/common/Uploader";
import { getFlagEmoji } from "../../../utils";
import { toast, Slide } from "react-toastify";
import Select from "react-select";

const CountryStep = ({
  username,
  country,
  profilePicture,
  onUpdateField,
  onNext,
}) => {
  const handleContinue = () => {
    if (!username || username.trim().length < 3) {
      toast.error("Please enter a valid username (min 3 characters).", {
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
    <div className="flex flex-col gap-8 justify-center items-center w-full text-white p-3">
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <h2 className="font-extrabold text-3xl mt-20">
          Let's set up your profile.
        </h2>
        <p className="text-lg">
          Tell us more about yourself so we can provide you a personalized
          experience tailored to your needs and preferences.
        </p>
      </div>

      <div className="w-full max-w-2xl p-6 space-y-6">
        <div>
          <label className="block text-white text-sm font-bold mb-2">
            Profile Picture
          </label>
          <Uploader
            initialImage={profilePicture}
            onImageSelected={(file) => onUpdateField("profilePicture", file)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-white text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-white text-black"
              value={username || ""}
              onChange={(e) => onUpdateField("username", e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="flex-1">
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
              maxMenuHeight={200}
              styles={{
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </div>

        <button
          className="bg-[#4C6BFF] w-full py-3 rounded text-white font-bold text-lg"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CountryStep;
