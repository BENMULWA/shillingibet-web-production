import { NavLink } from "react-router-dom";
import { FaPlane } from "react-icons/fa6";

export default function GameCategoryTabs() {
  return (
    <nav className="px-2 pt-4">
      <NavLink
        to="/aviator"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-black"
      >
        <FaPlane />
        Aviator
      </NavLink>
    </nav>
  );
}
