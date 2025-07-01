import { useState } from "react";
import { MdNavigateNext } from "react-icons/md";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { pricingOptions } from "../../constants/pricings";

const Pricings = ({ handleGetStarted }) => {
  const [pricing, setPricing] = useState("Monthly");

  const getPrice = (option) =>
    pricing === "Monthly" ? option.priceMonthly : option.priceYearly;

  return (
    <div className="text-gray-800 py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-xl mx-auto mb-20 text-center">
          <span className="block text-sm text-gray-500 font-medium mb-4">
            UMI
          </span>
          <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl leading-tight font-medium text-gray-900">
            Plans & Pricing
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 mb-8">
            Everyone can learn, yet premium makes it more efficient. <br />
            Explore our pricing and choose the one that best suits your needs.
          </p>
          <button
            type="btton"
            onClick={() => setPricing("Monthly")}
            className={`mr-6 text-lg pb-2 border-b-4 transition-colors duration-200 ${
              pricing === "Monthly"
                ? "border-purple-600 text-purple-950"
                : "text-neutral-600 border-transparent hover:border-neutral-400 hover:text-neutral-700"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPricing("Yearly")}
            className={`text-lg pb-2 border-b-4 transition-colors duration-200 ${
              pricing === "Yearly"
                ? "border-purple-600 text-purple-950"
                : "text-neutral-600 border-transparent hover:border-neutral-400 hover:text-neutral-700"
            }`}
          >
            Yearly (Saves 25%)
          </button>
        </div>

        <div className="relative flex flex-wrap items-center -mx-4 -mb-6 lg:mb-0">
          <div className="absolute inset-0 opacity-10 rounded-2xl filter blur-3xl"></div>

          {pricingOptions.map((option, index) => (
            <div
              key={index}
              className="relative w-full lg:w-1/3 px-4 mb-6 lg:mb-0 flex"
            >
              <div className="p-1 border border-gray-300 rounded-2xl transition-all duration-200 w-full flex flex-col">
                <div
                  className={`p-6 md:p-12 border-gray-200 rounded-xl lg:text-center shadow-md h-full flex flex-col justify-between ${
                    option.plan === "Starter"
                      ? "bg-gradient-to-r from-purple-200 via-purple-50 to-purple-200 border relative shadow-lg min-h-[600px]"
                      : option.plan === "Lite" 
                      ? "bg-gradient-to-bl from-blue-200 via-blue-50 to-blue-200 min-h-[500px]"
                      : "bg-gradient-to-br from-blue-200 via-blue-50 to-blue-200 min-h-[500px]"
                  }`}
                >
                  {option.plan === "Starter" && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-2 text-sm font-semibold bg-white rounded-md">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-medium text-gray-900">
                    {option.plan}
                  </h3>
                  <span className="inline-block mb-6 text-4xl md:text-6xl font-medium text-gray-800">
                    {getPrice(option) === "Free"
                      ? "Free"
                      : `RM ${getPrice(option)}`}
                  </span>

                  <ul className="mb-8 text-left text-lg text-gray-600">
                    {option.features.map((feature, i) => (
                      <li key={i} className="mb-2 flex items-center gap-1">
                        <IoCheckmarkCircleOutline />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    class={`inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold rounded-full transition-all hover:cursor-pointer duration-200 group
                            ${
                              option.plan === "Starter"
                                ? "text-neutral-950 bg-purple-300 hover:bg-shadow-600 hover:shadow-lg"
                                : "text-neutral-950 border-1 border-neutral-400 hover:border-neutral-950"
                            }
                        `}
                    onClick={(e) => handleGetStarted(e,option.plan,pricing)}
                  >
                    Get Started
                    {option.plan === "Starter" && <MdNavigateNext size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricings;
