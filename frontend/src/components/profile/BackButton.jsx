const BackButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed hover:cursor-pointer top-8 left-8 z-99999 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-filter backdrop-blur-md rounded-full p-2 transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default BackButton;