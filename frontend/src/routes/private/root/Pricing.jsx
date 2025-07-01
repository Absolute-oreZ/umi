import { useState } from "react";
import { pricingOptions } from "../../../constants/pricings";
import { useNavigate } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import { customFetch } from "../../../api/fetchInstance";

const Pricing = () => {
  const [interval, setInterval] = useState("Monthly");
  const navigate = useNavigate();

  const getPrice = (option) =>
    interval === "Monthly" ? option.priceMonthly : option.priceYearly;

  const handleGetStarted = async (e, plan, interval) => {
    e.preventDefault();

    if (plan === "Lite") {
      navigate("/me");
    } else {
      try {
        const planType = `${plan.toLowerCase()}_${interval.toLowerCase()}`;
        const formData = new FormData();
        formData.append("plan", planType);

        const res = await customFetch("/stripe/subscription-checkout-session", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.url) {
          window.open(data.url, "_blank", "noopener,noreferrer");
        }
      } catch (err) {
        console.error("Failed to open checkout session:", err);
        toast.error(`Error choosing a plan, please try again later.`, {
          closeOnClick: true,
          closeButton: true,
          isLoading: false,
          theme: "dark",
          autoClose: 3000,
          transition: Zoom,
        });
      }
    }
  };

  return (
    <section className="py-10 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container px-4 mx-auto">
        <div className="max-w-xl mx-auto mb-20 text-center">
          <span className="block text-sm text-neutral-400 font-medium mb-4">
            UMI
          </span>
          <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl leading-tight font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300">
            Plans & Pricing
          </h2>
          <p className="text-lg leading-relaxed text-neutral-300 mb-8">
            Everyone can learn, yet premium makes it more efficient. <br />
            Explore our pricing and choose the one that best suits your needs.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setInterval("Monthly")}
              className={`text-lg pb-2 border-b-4 transition-colors duration-200 ${
                interval === "Monthly"
                  ? "border-white text-white"
                  : "text-neutral-400 border-transparent hover:border-neutral-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("Yearly")}
              className={`text-lg pb-2 border-b-4 transition-colors duration-200 ${
                interval === "Yearly"
                  ? "border-white text-white"
                  : "text-neutral-400 border-transparent hover:border-neutral-400"
              }`}
            >
              Yearly (Saves 25%)
            </button>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center -mx-4 -mb-6 lg:mb-0">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-purple-900 via-purple-600 to-purple-900 rounded-2xl filter blur-3xl"></div>

          {pricingOptions.map((option) => (
            <div
              key={option.plan}
              className="relative w-full lg:w-1/3 px-4 mb-6 lg:mb-0"
            >
              <div className="p-1 border border-white border-opacity-20 rounded-2xl transition-all duration-200">
                <div
                  className={`p-6 md:p-12 border-gray-200 rounded-xl lg:text-center shadow-md h-full flex flex-col justify-between ${
                    option.plan === "Starter"
                      ? "bg-gradient-to-r from-purple-950 via-purple-800 to-purple-950 border relative shadow-lg min-h-[600px]"
                      : option.plan === "Lite"
                      ? "bg-gradient-to-bl from-neutral-950 via-neutral-800 to-neutral-950 min-h-[500px]"
                      : "bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-950 min-h-[500px]"
                  }`}
                >
                  {option.plan === "Starter" && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-2 text-sm font-semibold text-neutral-950 bg-white rounded-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300">
                    {option.plan}
                  </h3>

                  <span className="inline-block mb-6 text-4xl md:text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300">
                    {getPrice(option) === "Free"
                      ? "Free"
                      : `RM ${getPrice(option)}`}
                  </span>

                  <ul className="mb-8 text-left text-lg space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <svg
                          className="mr-2 w-6 h-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-neutral-300">{feature}</p>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => handleGetStarted(e, option.plan, interval)}
                    className={`inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 hover:cursor-pointer ${
                      option.plan === "Starter"
                        ? "text-neutral-950 bg-white hover:bg-neutral-100 hover:shadow-lg group"
                        : "text-white border border-neutral-700 hover:border-white hover:border-opacity-50"
                    }`}
                  >
                    Get Started
                    {option.plan === "Starter" && (
                      <svg
                        className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
