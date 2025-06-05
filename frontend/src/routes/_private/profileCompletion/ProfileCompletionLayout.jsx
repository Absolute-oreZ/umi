const ProfileCompletionLayout = ({
  title,
  description,
  children,
  onContinue,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-8 justify-center items-center w-full text-white p-3">
      <div className="flex flex-col items-center gap-4 max-w-2xl text-center">
        <h2 className="font-extrabold text-3xl mt-20">{title}</h2>
        <p className="text-lg">{description}</p>
      </div>

      <div className="w-full max-w-2xl p-6 space-y-6">
        {children}

        <button
          className="bg-[#4C6BFF] w-full py-3 rounded text-white font-bold text-lg"
          onClick={onContinue}
        >
          {isLoading ? <p>Loading...</p> : <p>Continue</p>}
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionLayout;
