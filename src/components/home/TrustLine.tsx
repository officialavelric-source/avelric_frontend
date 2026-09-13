import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stars } from "../common";
import { getGlobalRatingSummary, subscribeToReviews } from "../../services/reviewService";

export default function TrustLine() {
  const [summary, setSummary] = useState(() => getGlobalRatingSummary());

  useEffect(() => {
    const update = () => setSummary(getGlobalRatingSummary());
    update();
    return subscribeToReviews(update);
  }, []);

  return (
    <Link
      to="/reviews"
      className="group flex items-center justify-center gap-2.5 border-b border-softblack/10 bg-ivory py-3 text-[12px] text-warmgray transition-colors hover:text-softblack"
    >
      {summary.totalReviews > 0 ? (
        <>
          <Stars rating={summary.averageRating} className="h-3.5 w-3.5" />
          <span>
            <span className="font-semibold text-softblack">{summary.averageRating.toFixed(1)}</span>{" "}
            average from {summary.totalReviews} verified client {summary.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </>
      ) : (
        <>
          <Stars rating={5} className="h-3.5 w-3.5" />
          <span>
            Real client reviews & verified purchase experiences
          </span>
        </>
      )}
      <span aria-hidden="true" className="transition-transform duration-250 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
