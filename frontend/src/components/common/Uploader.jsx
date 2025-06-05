import React, { useState, useEffect } from "react";
import { validateFileSize } from "../../utils";
import { toast,Slide } from "react-toastify";

const Uploader = ({ initialImage, onImageSelected }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (initialImage && typeof initialImage === "string") {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const { isValid, message } = validateFileSize(file, 5 * 1024 * 1024); // 5 MB

      if (!isValid) {
        toast.error(`${message}`, {
          position: "bottom-right",
          autoClose: 5000,
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

      onImageSelected(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white text-black flex items-center justify-center cursor-pointer">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-xl">+</span>
            <span className="text-xs mt-1">Upload</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Uploader;
