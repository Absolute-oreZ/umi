import { toast, Zoom } from "react-toastify";
import useCache from "../../hooks/useCache";
import useLocalStorage from "../../hooks/useLocalStorage";

const SaveButton = ({ url }) => {
  const { saveToCache } = useCache();
  const [saved, setSaved] = useLocalStorage("savedResources", []);

  const handleSave = async () => {
    try {
      await saveToCache(url);
      if (!saved.includes(url)) {
        setSaved([...saved, url]);
        toast.success(`Successfully saved the resouce for offline usage.`, {
          closeOnClick: true,
          closeButton: true,
          isLoading: false,
          theme: "dark",
          autoClose: 3000,
          transition: Zoom,
        });
      } else {
        toast.info(`The resouce has already been saved.`, {
          closeOnClick: true,
          closeButton: true,
          isLoading: false,
          theme: "dark",
          autoClose: 3000,
          transition: Zoom,
        });
      }
    } catch (error) {
      toast.error(`Failed to save resource, please try again later.`, {
        closeOnClick: true,
        closeButton: true,
        type: "error",
        isLoading: false,
        theme: "dark",
        autoClose: 3000,
        transition: Zoom,
      });
      console.error(error);
    }
  };

  return (
    <button onClick={handleSave}>
      <span className="text-purple-300 hover:cursor-pointer hover:underline">
        Save for Offline
      </span>
    </button>
  );
};

export default SaveButton;
