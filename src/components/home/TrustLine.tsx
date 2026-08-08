import { Link } from "react-router-dom";
import { Stars } from "../common";
import { AVG_RATING } from "../../data/reviews";

export default function TrustLine() {
  return (
    <Link
      to="/reviews"
      className="group flex items-center justify-center gap-2.5 border-b border-softblack/10 bg-ivory py-3 text-[12px] text-warmgray transition-colors hover:text-softblack"
    >
      <Stars rating={Number(AVG_RATING)} className="h-3.5 w-3.5" />
      <span>
        <span className="font-semibold text-softblack">{AVG_RATING}</span> average from 1,200+ orders
      </span>
      <span aria-hidden="true" className="transition-transform duration-250 group-hover:translate-x-1">→</span>
    </Link>
  );
}
