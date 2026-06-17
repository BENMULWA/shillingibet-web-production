import { useNavigate } from "react-router-dom";
import BaseClass from "../services/BaseClass";
import { FaFutbol, FaSpaceShuttle, FaPlane } from "react-icons/fa";
import { IoAirplane, IoRocket } from "react-icons/io5";
import { GiCastle } from "react-icons/gi";

const categories = [
  { id: "sports", label: "SPORTS", path: "/sports", icon: <FaFutbol size={24} /> },
  { id: "aviator", label: "AVIATOR", path: "/aviator", icon: <IoAirplane size={24} className="-rotate-45" /> },
  { id: "aviatrix", label: "AVIATRIX", path: "/aviatrix", icon: <FaSpaceShuttle size={24} className="-rotate-45" /> },
  { id: "crashx", label: "CRASH X", path: "/turbo/crash", icon: <IoRocket size={24} /> },
  { id: "aero", label: "AERO", path: "/turbo/aero", icon: <FaPlane size={24} /> },
  { id: "crashroyale", label: "CRASH ROYALE", path: "/imoon/1001", icon: <GiCastle size={24} /> },
];

export default function GameCategoryTabs() {
  const navigate = useNavigate();
  const baseClass = new BaseClass();

  const handleCategoryClick = (category) => {
    if (baseClass.userId) {
      navigate(category.path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="w-full bg-[#facc15] flex overflow-x-auto no-scrollbar shadow-lg border-y-2 border-[#eab308] mt-2 mb-4">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category)}
          className={`group flex flex-1 flex-col items-center justify-center py-3 min-w-[16.66%] shrink-0 hover:bg-[#eab308] transition-colors cursor-pointer ${
            index !== categories.length - 1 ? "border-r border-[#eab308]" : ""
          }`}
        >
          <div className="text-black mb-1.5 group-hover:scale-110 transition-transform">{category.icon}</div>
          <span className="text-black text-[9px] md:text-[11px] font-black tracking-wider text-center px-1">
            {category.label}
          </span>
        </button>
      ))}
    </div>
  );
}
