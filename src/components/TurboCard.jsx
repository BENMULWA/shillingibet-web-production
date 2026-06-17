import { Link } from "react-router";
import BaseClass from "../services/BaseClass";

function TurboCard({ src, gameAlias }) {
  const Base = new BaseClass();
  const linkTo = !Base.isAuthenticated() ? `/login` : `/turbo/${gameAlias}`;

  return (
    <Link to={linkTo}>
      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg bg-[#1b1c20] group cursor-pointer transition-transform duration-300 hover:scale-105">
        <img
          src={src}
          // crossOrigin="anonymous"
          loading="lazy"
          alt={gameAlias}
          className="w-full h-full object-center rounded-lg"
        />
      </div>
    </Link>
  );
}
export default TurboCard;
