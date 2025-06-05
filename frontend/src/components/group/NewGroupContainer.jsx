import { useState } from "react";
import Uploader from "../common/Uploader";
import TitleCard from "../common/TitleCard";

const NewGroupContainer = ({
  toggleForm,
  isFormVisible,
  handleAskToJoinGroup,
  handleCreateGroup,
  recommendedgroups,
}) => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [icon, setIcon] = useState(null);
  const [includeBot, setIncludeBot] = useState(true);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("about", about);
    formData.append("includeBot", includeBot);
    if (icon) formData.append("icon", icon);

    handleCreateGroup(formData);
  };

  return (
    <div
      className="overlay fixed inset-0 bg-black opacity-80 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={toggleForm}
    >
      <div
        className={`flex max-lg:flex-col gap-4 bg-gray-800 p-6 rounded-md shadow-lg transition-all duration-500 ease-out z-50 ${
          isFormVisible && "opacity-100 translate-y-0 slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h2 className="text-2xl mb-8">Let's create a new group!</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="flex gap-5 mb-2">
              <div>
                <label className="block text-sm font-semibold mb-4">
                  Group Icon
                </label>
                <div className="mb-4">
                  <Uploader
                    initialImage={icon}
                    onImageSelected={(file) => setIcon(file)}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full">
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    Name
                  </label>
                  <input
                    autoComplete="off"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Give your group a fancy name!"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    About
                  </label>
                  <input
                    autoComplete="off"
                    type="text"
                    name="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-60 p-2 border border-gray-300 rounded-md"
                    placeholder="Tell others about your group~"
                  />
                </div>
              </div>
            </div>
            <div className="flex mb-4 gap-1 items-center">
              <input
                id="includeBot"
                name="includeBot"
                type="checkbox"
                checked={includeBot}
                onChange={() => setIncludeBot((prev) => !prev)}
              />
              <label>Include Robin (a multipurpose chat bot). </label>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-red-600 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-300 text-primary rounded-md hover:cursor-pointer hover:bg-purple-700 hover:text-white"
              >
                Create
              </button>
            </div>
          </form>
        </div>
        <div className="p-4">
          <h2 className="text-2xl mb-8">Or join a recommended one!</h2>
          {recommendedgroups.map((group, index) => (
            <div
              key={index}
              className="flex gap-3 p-2 items-center justify-between"
            >
              <TitleCard group={group} />
              <button
                onClick={() => handleAskToJoinGroup(group.id)}
                className="green-button"
              >
                Ask to Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewGroupContainer;
