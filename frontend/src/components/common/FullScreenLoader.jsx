import { FaSpinner } from "react-icons/fa";

const FullScreenLoader = ({ text }) => {
  return (
    <div className="w-full h-full fixed top-0 left-0 opacity-80 z-50 text-white">
      <div className="flex flex-col gap-3 justify-center items-center mt-[50vh]">
        <FaSpinner className="animate-spin text-violet-600 text-5xl" />
        <p className="text-2xl font-bold">{text}</p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
