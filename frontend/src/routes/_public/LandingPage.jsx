import React, { useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { testimonials } from "../../constants";

const planType = ["Pay Monthly", "Pay Yearly (save 25%)"];

const LandingPage = () => {
  const { keycloak } = useKeycloak();
  const [selectedPlan, setSelectedPlan] = useState(planType[0]);

  const redirectUrl = import.meta.env.VITE_KEYCLOAK_REDIRECT_URL;

  const handleLogin = async () => {
    try {
      await keycloak.login({ redirectUri: `${redirectUrl}/groups` });
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleRegister = async () => {
    await keycloak.register({
      redirectUri: `${redirectUrl}/profile-completion`,
    });
  };

  return (
    <div className="relative bg-landing-bg flex flex-col gap-20">
      {/* Hero Section */}
      <div className="relative flex flex-col h-screen p-10 text-white">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-10"></div>

        {/* Navbar */}
        <div className="relative flex justify-between items-center z-10">
          <img className="w-6 h-6" src="icons/logo.png" alt="logo" />
          <div className="flex gap-5 items-center">
            <a href="#">Resources</a>
            <a href="#">Contact</a>
            <button
              onClick={handleLogin}
              className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black"
            >
              Sign In
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300"
            >
              Register
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center mt-36 z-10">
          <h1 className="text-8xl font-mono font-extrabold text-gray-500">
            UMI
          </h1>
          <p className="text-center text-4xl mt-4">
            Ride the wave of knowledge with UMI <br />
            where collaboration flows and ideas set sail
          </p>
          <button
            onClick={handleRegister}
            className="mt-12 px-8 py-3 bg-white text-black rounded hover:bg-gray-200"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-wrap justify-around items-center p-10 text-white">
        <StatisticCard
          emoji="📚"
          count="1 Million"
          title="Learning Materials"
        />
        <StatisticCard emoji="👨‍🎓" count="1000" title="Active Learners" />
        <StatisticCard emoji="👥" count="200" title="Study Groups" />
        <StatisticCard emoji="🏫" count="30" title="Education Institutions" />
      </div>

      {/* Testimonials */}
      <div className="p-10 text-white">
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <TestimonialItem key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Pricing Plan Toggle */}
      <div className="text-white flex flex-col p-10 items-center">
        <h1 className="mb-3 text-2xl font-semibold">PLANS & PRICINGS</h1>
        <h2 className="text-lg mb-10">
          Everyone can learn, yet premium makes it more efficient
        </h2>
        <div className="flex gap-4 mb-10">
          {planType.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPlan(type)}
              className={`px-4 py-2 rounded border ${
                selectedPlan === type
                  ? "bg-white text-black"
                  : "border-white text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-wrap justify-center gap-10">
          {pricingOptions.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-10 text-white border-t border-gray-600">
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <img className="w-6 h-6" src="icons/logo.png" alt="logo" />
            <div className="flex gap-4">
              <span>❌</span>
              <span>📷</span>
              <span>📺</span>
              <span>🔗</span>
            </div>
          </div>
          <div className="flex gap-10">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatisticCard = ({ emoji, count, title }) => (
  <div className="flex items-center gap-3 text-xl w-64 justify-center">
    <span className="text-2xl">{emoji}</span>
    <div>
      <p className="font-bold">{count}+</p>
      <p>{title}</p>
    </div>
  </div>
);

const TestimonialItem = ({ testimonial, author }) => (
  <div className="bg-gray-800 p-6 rounded shadow text-center">
    <blockquote className="italic text-lg">"{testimonial}"</blockquote>
    <cite className="block mt-4 text-sm font-semibold">– {author}</cite>
  </div>
);

const PricingCard = ({
  header,
  type,
  target,
  price,
  features,
  joinQuote,
  isMostPopular,
}) => (
  <div className="w-80 bg-gray-100 rounded-md overflow-hidden text-black">
    <div className="bg-green-300 text-center p-2 text-sm font-semibold">
      {header}
    </div>
    <div className="p-6 flex flex-col gap-3">
      <div>
        <h3 className="text-2xl font-bold">{type}</h3>
        <p className="text-sm text-gray-600">{target}</p>
        <p className="text-4xl font-extrabold mt-2">{price}</p>
      </div>
      <ul className="text-sm list-disc ml-5">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      <button className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
        {joinQuote}
      </button>
    </div>
  </div>
);

const pricingOptions = [
  {
    isMostPopular: false,
    header: "RM 0.00, Always",
    type: "Basic",
    target: "Solo Learner",
    price: "Free",
    features: [
      "24/7 Ticket Support System",
      "Unlimited resource access",
      "3 Study groups",
      "5 AI Summarizer",
    ],
    joinQuote: "Sign Up For Free",
  },
  {
    isMostPopular: true,
    header: "RM 0.00 for your first month",
    type: "Premium",
    target: "Advanced Learner",
    price: "RM 50 / mo",
    features: [
      "24/7 Ticket Support System",
      "Unlimited resource access",
      "5 Study groups",
      "10 AI Summarizer",
      "Offline library for pre-downloaded resources",
    ],
    joinQuote: "Start Free Trial",
  },
  {
    isMostPopular: false,
    header: "RM 100.00 for the first three months",
    type: "Plus",
    target: "Education Institution",
    price: "RM 300 / mo",
    features: ["Internal resource library", "Up to 10,000 learners"],
    joinQuote: "Join now for RM 100",
  },
];

export default LandingPage;
