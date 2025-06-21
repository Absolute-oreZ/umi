import { TbFileTypeDocx, TbFileTypePdf } from "react-icons/tb";
import { useState, useRef, useEffect } from "react";
import { formatDate,validateFileSize } from "../../utils";

const ResourceCard = ({ res, currentGroups, handleForwardResource }) => {
  const isImage = res.category === "IMAGE";
  const isVideo = res.category === "VIDEO";

  const createdDate = formatDate(res.createdDate);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedGroupsIds, setselectedGroupsIds] = useState([]);
  const popupRef = useRef(null);
  const forwardButtonRef = useRef(null);

  const handleSelectGroup = (e) => {
    if (e.target.checked) {
      setselectedGroupsIds((prev) => [...prev, e.target.id]);
    } else {
      setselectedGroupsIds((prev) => prev.filter((id) => id !== e.target.id));
    }
  };

  const handleForwardClicked = () => {
    selectedGroupsIds.forEach(async (id) => {
      await handleForwardResource(res.resourcePath, id);
    });

    setIsPopupOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        forwardButtonRef.current &&
        !forwardButtonRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
      }
    }

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  return (
    <div className="flex justify-between items-center p-3 hover:bg-gray-700 rounded-md relative">
      <div className="flex space-x-4">
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
          {isImage ? (
            <img
              src={res.resourcePath}
              alt={res.name}
              className="object-cover w-full h-full"
            />
          ) : isVideo ? (
            <video
              src={res.resourcePath}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : res.category.toLowerCase() === "docx" ? (
            <TbFileTypeDocx size={36} className="text-blue-600" />
          ) : res.category.toLowerCase() === "pdf" ? (
            <TbFileTypePdf size={36} className="text-red-600" />
          ) : (
            <div className="text-gray-400">N/A</div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-lg text-white font-semibold">{res.name}</p>
          <span className="text-sm text-gray-600 capitalize mt-1">
            Type: {res.category.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-sm text-gray-500 whitespace-nowrap relative">
        <p>{createdDate}</p>
        <div className="flex gap-2 relative">
          <a
            href={res.resourcePath}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-purple-300 hover:text-purple-400"
          >
            Download
          </a>
          <button
            ref={forwardButtonRef}
            onClick={() => setIsPopupOpen((prev) => !prev)}
            className="hover:underline text-purple-300 hover:text-purple-400 hover:cursor-pointer relative"
          >
            Forward
          </button>

          {isPopupOpen && (
            <div
              ref={popupRef}
              className="absolute right-0 h-fit -mt-2 w-64 bg-gray-600 p-3 rounded-md shadow-lg z-50"
            >
              <p className="text-xl font-semibold py-2 px-1 text-white mb-3">
                Forward to ...
              </p>
              <button
                onClick={handleForwardClicked}
                disabled={selectedGroupsIds.length == 0}
                className="bg-purple-300 p-2 rounded-md text-black mb-3 w-full cursor-pointer disabled:cursor-not-allowed disabled:bg-pink-200"
              >
                Forward
              </button>
              {currentGroups.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between hover:bg-gray-600 rounded-md  w-full p-2 items-center"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      {g.iconPath ? (
                        <img
                          src={g.iconPath}
                          alt="Group Icon"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <GiRamProfile className="text-white text-xl" />
                        </div>
                      )}
                      <label className="truncate max-w-35 text-[20px] text-slate-400">
                        {g.name}
                      </label>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectGroup(e)}
                    id={g.id}
                    name={g.id}
                    className="w-4 h-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
