import { memo } from "react";
import { Link } from "react-router-dom";
import BaseClass from "../services/BaseClass";

const AviatrixBetsCard = memo(function AviatrixBetsCard({ src }) {
  const baseClass = new BaseClass();

  const linkTo = baseClass.userId ? `/aviatrix` : `/login`;

  return (
    <Link to={linkTo}>
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg bg-[#1b1c20] group cursor-pointer transition-transform duration-300 hover:scale-105">
        <img
          src={src}
          alt="aviatrix"
          loading="lazy"
          className="w-full h-full object-center rounded-lg"
        />
      </div>
    </Link>
  );
});

export default AviatrixBetsCard;
