import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "../../../context/AuthContext";
import { ProfilePageSkeleton } from "../../../skeletons";

const ProfilePage = () => {
  const { user, loading, fetchingUserData } = useAuth();

  if (!user || loading || fetchingUserData) {
    return <ProfilePageSkeleton />;
  }

  const {
    username,
    email,
    profilePicturePath,
    learningPreference: { country, personality, learningStyles },
    accountPremium,
  } = user;

  return (
    <div className="w-full text-white px-6 p-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-lg py-6 flex flex-col items-center">
          {profilePicturePath ? (
            <img
              src={profilePicturePath}
              alt="Profile"
              className="w-30 h-30 rounded-full object-cover mb-4 border-4 border-gray-600"
            />
          ) : (
            <CgProfile className="w-30 h-30" />
          )}

          <div className="text-center">
            <h1 className="text-3xl font-semibold">{username}</h1>
            <p className="text-sm text-gray-400 mt-2 flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 00-6-6zM8 8a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
              {country || "Unknown"}
            </p>
            <Link to="/edit-profile">
              <button className="mt-4 px-4 py-2 w-full bg-gray-900 text-white rounded hover:bg-gray-700">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

        <div className="col-span-2 space-y-8">
          <div className="rounded-lg p-6">
            <h2 className="text-3xl mb-8 font-semibold text-start text-gradient">
              Hello There, {username} Here
            </h2>
            <p className="text-base border-t-2 rounded-md border-cyan-500 py-3">
              Hello, I'm {username} from {country || "an unknown location"}! I
              enjoy learning through a combination of{" "}
              {learningStyles.map((style, index) => (
                <span
                  key={index}
                  className={`${
                    index !== learningStyles.length - 1 ? "mr-1" : ""
                  } text-blue-400`}
                >
                  {style}
                  {index !== learningStyles.length - 1 ? "," : ""}
                </span>
              ))}
              . I'm actually an{" "}
              <span className="text-cyan-400">{personality}</span>{" "}
            </p>
            <p>
              Feel free to drop me a message at{" "}
              <a
                className="hover:underline hover:text-blue-400"
                target="_blank"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </p>
          </div>

          <div className="rounded-lg p-6">
            <h2 className="text-xl font-semibold text-pink-500 mb-4">Badges</h2>
            <div className="flex space-x-4 text-base border-t-2 rounded-md border-cyan-500 py-3">
              {accountPremium ? (
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  ⭐ Premium Member
                </span>
              ) : (
                <p>No badges yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
