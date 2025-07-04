import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import { testimonials } from "../../constants";
import Pricings from "../../components/common/Pricings";
import CountUp from "../../components/common/CountUp";
import { useAuth } from "../../context/AuthContext";
import { customFetch } from "../../api/fetchInstance";

const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleGetStarted = async (e, plan, interval) => {
    e.preventDefault();

    if (!session) {
      navigate("/login");
      return;
    }

    if (plan === "Lite") {
      navigate("/me");
    } else {
      try {
        const planType = plan.toLowerCase() + "_" + interval.toLowerCase();
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

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-landing-bg flex flex-col gap-20">
      <div className="relative flex flex-col h-screen p-10 text-white">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-10"></div>

        <div className="relative flex justify-between items-center z-10">
          <img className="w-6 h-6" src="icons/logo.png" alt="logo" />
          <div className="flex gap-5 items-center">
            <Link to="/resources" className="text-black">
              Resources
            </Link>
            <Link to="/contact" className="text-black">
              Contact
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 border border-black text-dark-100 rounded hover:bg-gray-300 hover:border-white hover:text-black no-underline"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 border-black border-1 hover:border-white text-black rounded hover:bg-gray-300 no-underline"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-36 z-10">
          <h1 className="text-8xl font-mono font-extrabold text-gray-500">
            UMI
          </h1>
          <p className="text-center text-slate-600 text-4xl mt-4">
            Ride the wave of knowledge with UMI <br />
            where collaboration flows and ideas set sail
          </p>
          <Link
            to="/signup"
            className="mt-12 px-8 py-3 bg-white text-black rounded hover:bg-gray-200"
          >
            Join Now
          </Link>
        </div>
      </div>

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

      <div className="p-10 text-slate-700">
        <h2 className="text-4xl font-bold text-center mb-12 drop-shadow-md">
          What Our Users Say
        </h2>
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentTestimonialIndex * 100}%)`,
              }}
            >
              {testimonials.map((item, i) => (
                <div key={i} className="w-full flex-shrink-0">
                  <TestimonialItem {...item} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full text-slate-600 text-2xl hover:bg-opacity-50 transition-all duration-300 focus:outline-none"
            aria-label="Previous testimonial"
          >
            &#8249;
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-600 p-3 rounded-full  text-2xl hover:bg-opacity-50 transition-all duration-300 focus:outline-none"
            aria-label="Next testimonial"
          >
            &#8250;
          </button>
        </div>
      </div>

      <Pricings handleGetStarted={handleGetStarted} />

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
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatisticCard = ({ emoji, count, title }) => (
  <div className="flex items-center gap-3 text-xl w-64 justify-center text-slate-700">
    <span className="text-2xl">{emoji}</span>
    <div>
      <CountUp
        from={0}
        to={count}
        separator=","
        direction="up"
        duration={1}
        className="count-up-text"
      />
      <p>{title}</p>
    </div>
  </div>
);

const TestimonialItem = ({ testimonial, author }) => (
  <div className="p-8 text-center flex flex-col items-center justify-center min-h-[250px] transform hover:scale-[1.02] transition-transform duration-300">
    <p className="italic text-xl text-gray-700 leading-relaxed mb-6 font-serif">
      "{testimonial}"
    </p>
    <cite className="block mt-4 text-sm font-semibold text-purple-600">
      {author}
    </cite>
  </div>
);

export default LandingPage;
