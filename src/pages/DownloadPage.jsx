import { useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookmarkPlus,
  Check,
  CircleHelp,
  ChevronRight,
  Download,
  Flag,
  Gamepad2,
  Globe2,
  Grid3X3,
  LockKeyhole,
  Laptop,
  Mail,
  Phone,
  MessageCircle,
  MoreVertical,
  Share2,
  Search,
  ShieldCheck,
  Star,
  WifiOff,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePwaInstall } from "../hooks/usePwaInstall";

const screenshots = [
  { src: "/register-banner.webp", label: "Join ShilingiBet" },
  { src: "/refer-banner.png", label: "Refer and earn" },
  { src: "/cashback-banner.png", label: "Daily cashback" },
  { src: "/a1.png", label: "Play exciting games" },
];

const features = [
  "Aviator, crash and virtual games",
  "Fast M-Pesa deposits and withdrawals",
  "Jackpots, promotions and daily rewards",
  "One-tap access from your home screen",
];

const featuredReviews = [
  {
    name: "James Ng'ang'a",
    initial: "J",
    avatarClass: "bg-[#fb7185]",
    date: "February 14, 2026",
    message: "Withdrawals are fast and money reaches M-Pesa without unnecessary waiting. The app is simple to use and easy to navigate.",
    helpful: 14,
  },
  {
    name: "Peter Mbogua",
    initial: "P",
    avatarClass: "bg-[#07875f]",
    date: "December 20, 2025",
    message: "The daily cashback is a great reward. It keeps the experience enjoyable even after a difficult day of games.",
    helpful: 11,
  },
  {
    name: "Lilian Yeti",
    initial: "L",
    avatarClass: "bg-[#667085]",
    date: "January 30, 2026",
    message: "The referral rewards are useful, and inviting friends is straightforward. Deposits and withdrawals are easy to manage.",
    helpful: 9,
  },
];

export default function DownloadPage() {
  const navigate = useNavigate();
  const { installed, install } = usePwaInstall();
  const [installing, setInstalling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [pendingReview, setPendingReview] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pendingAppReview")) || null;
    } catch {
      return null;
    }
  });
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await install();
      if (accepted) return;

      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      toast(
        isIos
          ? "Tap Share, then choose Add to Home Screen."
          : "Open your browser menu and choose Install app or Add to Home screen."
      );
    } finally {
      setInstalling(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "ShilingiBet App",
      text: "Install ShilingiBet for quick access to your favourite games.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Download link copied");
      }
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Unable to share the link");
    }
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const name = reviewName.trim();
    const message = reviewText.trim();

    if (!reviewRating) {
      toast.error("Choose a star rating");
      return;
    }
    if (name.length < 2) {
      toast.error("Enter your name");
      return;
    }
    if (message.length < 10) {
      toast.error("Your review must be at least 10 characters");
      return;
    }

    const review = {
      name,
      message,
      rating: reviewRating,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("pendingAppReview", JSON.stringify(review));
    setPendingReview(review);
    setShowReviewForm(false);
    toast.success("Review submitted for verification");
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-[480px] bg-white text-[#17221b]">
      <header className="sticky top-0 z-20 border-b border-[#dce4de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex items-center px-4 py-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-2 transition hover:bg-[#edf3ef]"
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </button>
          <img src="/app-icon.svg" alt="" className="ml-1 h-7 w-7 rounded-lg" />
          <span className="ml-3 text-lg font-semibold">ShilingiBet Apps</span>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => navigate("/search")} className="rounded-full p-2 hover:bg-[#edf3ef]" aria-label="Search"><Search size={21} /></button>
            <a href="/support" className="rounded-full p-2 hover:bg-[#edf3ef]" aria-label="Help"><CircleHelp size={21} /></a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full px-4 py-7">
        <section>
          <div className="flex items-center gap-4">
            <img
              src="/pwa-192.png"
              alt="ShilingiBet app icon"
              className="h-20 w-20 rounded-2xl shadow-md"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">ShilingiBet</h1>
              <p className="mt-1 font-semibold text-[#087f5b]">ShilingiBet Kenya</p>
              <p className="mt-1 text-sm text-[#647068]">Entertainment</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 divide-x divide-[#dce4de] text-center">
            <div className="px-2">
              <div className="flex items-center justify-center gap-1 text-sm font-bold">
                PWA <Star size={12} fill="currentColor" />
              </div>
              <p className="mt-1 text-xs text-[#68746c]">Installable app</p>
            </div>
            <div className="px-2">
              <div className="flex items-center justify-center text-sm font-bold">18+</div>
              <p className="mt-1 text-xs text-[#68746c]">Rated for 18+</p>
            </div>
            <div className="px-2">
              <div className="flex items-center justify-center gap-1 text-sm font-bold"><Laptop size={15} /></div>
              <p className="mt-1 text-xs text-[#68746c]">All devices</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstall}
            disabled={installed || installing}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#07875f] px-5 py-3 font-bold text-white transition hover:bg-[#066f50] disabled:cursor-default disabled:bg-[#78948a]"
          >
            {installed ? <Check size={18} /> : <Download size={18} />}
            {installed ? "Installed" : installing ? "Opening installer…" : "Install"}
          </button>

          <div className="mt-3 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#087f5b] hover:bg-[#e8f4ee]"
            >
              <Share2 size={17} /> Share
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved((current) => !current);
                toast.success(saved ? "Removed from saved apps" : "Saved for later");
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#087f5b] hover:bg-[#e8f4ee]"
            >
              <BookmarkPlus size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save for later"}
            </button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-[#526057]"><Laptop size={17} /> This app is available for your device</p>
        </section>

        <section className="mt-7">
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-3">
            {screenshots.map((screenshot) => (
              <figure
                key={screenshot.src}
                className="relative aspect-[3/4] w-[128px] shrink-0 snap-start overflow-hidden rounded-xl bg-[#07120b] shadow-sm"
              >
                <img
                  src={screenshot.src}
                  alt={screenshot.label}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/register-banner.webp";
                  }}
                  className="h-full w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 text-xs font-bold text-white">
                  {screenshot.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-7 border-t border-[#dce4de] pt-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            About this app <ChevronRight size={20} />
          </h2>
          <p className="mt-4 font-semibold">Step into the excitement with ShilingiBet</p>
          <p className="mt-3 max-w-3xl leading-7 text-[#435048]">
            Discover an easy way to access virtual games, crash games, jackpots and promotions. The installable experience launches from your home screen and always stays up to date.
          </p>
          <ul className="mt-4 space-y-2 text-[#435048]">
            {features.map((feature) => (
              <li key={feature}>· {feature}</li>
            ))}
          </ul>
        </section>

        <section className="mt-9 border-t border-[#dce4de] pt-8">
          <h2 className="flex items-center gap-2 text-xl font-black">
            Data safety <ChevronRight size={20} />
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#526057]">
            Security starts with understanding how your information is handled. ShilingiBet uses account and transaction information to operate betting and payment services.
          </p>
          <div className="mt-5 grid gap-4 rounded-2xl border border-[#dce4de] bg-white p-5">
            <div className="flex gap-3"><LockKeyhole className="shrink-0 text-[#087f5b]" size={20} /><span className="text-sm font-semibold">Data is encrypted in transit</span></div>
            <div className="flex gap-3"><ShieldCheck className="shrink-0 text-[#087f5b]" size={20} /><span className="text-sm font-semibold">Protected account access</span></div>
            <div className="flex gap-3"><WifiOff className="shrink-0 text-[#087f5b]" size={20} /><span className="text-sm font-semibold">Payments and games require internet</span></div>
          </div>
        </section>

        <section className="mx-auto mt-9 max-w-3xl border-t border-[#dce4de] pt-8">
          <h2 className="flex items-center gap-2 text-xl font-black">
            Ratings and reviews <ChevronRight size={20} />
          </h2>
          <p className="mt-2 text-sm text-[#667085]">Ratings and reviews are verified before publishing</p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e7f8ef] px-3 py-1 text-sm text-[#185c47]">
            <Phone size={15} /> Phone
          </span>

          <div className="mt-6 grid grid-cols-[82px_1fr] items-center gap-5">
            <div>
              <div className="text-5xl font-normal leading-none">4.7</div>
              <div className="mt-2 flex text-[#07875f]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-xs text-[#667085]">59 reviews</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-xs text-[#667085]">
                  <span className="w-2">{rating}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#e1e5e8]">
                    <span
                      className="block h-full rounded-full bg-[#07875f]"
                      style={{ width: rating === 5 ? "88%" : rating === 4 ? "16%" : rating === 3 ? "6%" : "4%" }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {featuredReviews.map((review, index) => (
              <article key={review.name}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${review.avatarClass}`}>
                    {review.initial}
                  </span>
                  <span className="font-semibold">{review.name}</span>
                  <MoreVertical className="ml-auto text-[#667085]" size={18} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="flex text-[#07875f]">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill="currentColor" />)}
                  </span>
                  <span className="text-xs text-[#667085]">{review.date}</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6">{review.message}</p>
                <p className="mt-2 text-xs text-[#667085]">
                  {review.helpful + (helpfulVotes[index] === "yes" ? 1 : 0)} people found this review helpful
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span>Did you find this helpful?</span>
                  {[
                    ["yes", "Yes"],
                    ["no", "No"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setHelpfulVotes((votes) => ({ ...votes, [index]: value }))}
                      className={`rounded-full border px-4 py-1.5 ${helpfulVotes[index] === value ? "border-[#07875f] bg-[#e7f8ef] text-[#087f5b]" : "border-[#cfd8d2]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <button type="button" className="mt-7 text-sm font-semibold text-[#087f5b]">See all reviews</button>

          {pendingReview && (
            <div className="mt-7 rounded-xl border border-[#b9dfce] bg-[#f2fbf6] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">Your review</div>
                <span className="rounded-full bg-[#d9f4e5] px-3 py-1 text-xs font-semibold text-[#087f5b]">Pending verification</span>
              </div>
              <div className="mt-2 flex text-[#07875f]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={17} fill={star <= pendingReview.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-3 font-semibold">{pendingReview.name}</p>
              <p className="mt-1 text-sm leading-6 text-[#526057]">{pendingReview.message}</p>
            </div>
          )}

          {!pendingReview && !showReviewForm && (
          <div className="mt-7 rounded-xl border border-[#dce4de] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-[#e7f8ef] p-2 text-[#087f5b]"><MessageCircle size={20} /></span>
              <div>
                <h3 className="font-bold">Share your experience</h3>
                <p className="mt-1 text-sm leading-6 text-[#667085]">Your feedback will appear here after verification.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="mt-4 inline-flex rounded-full border border-[#cfd8d2] px-4 py-2 text-sm font-semibold text-[#087f5b] hover:bg-[#e7f8ef]"
            >
              Write a review
            </button>
          </div>
          )}

          {!pendingReview && showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mt-7 rounded-xl border border-[#b9dfce] bg-white p-5">
              <h3 className="text-lg font-bold">Rate your experience</h3>
              <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={reviewRating === star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-[#07875f] transition hover:scale-110"
                  >
                    <Star size={30} fill={star <= reviewRating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <label className="mt-5 block text-sm font-semibold" htmlFor="review-name">Your name</label>
              <input
                id="review-name"
                value={reviewName}
                onChange={(event) => setReviewName(event.target.value)}
                maxLength={60}
                className="mt-2 w-full rounded-lg border border-[#cfd8d2] bg-white px-3 py-2.5 text-[#17221b] outline-none focus:border-[#07875f] focus:ring-2 focus:ring-[#07875f]/20"
                placeholder="Enter your name"
              />
              <label className="mt-4 block text-sm font-semibold" htmlFor="review-message">Your review</label>
              <textarea
                id="review-message"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                maxLength={500}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-[#cfd8d2] bg-white px-3 py-2.5 text-[#17221b] outline-none focus:border-[#07875f] focus:ring-2 focus:ring-[#07875f]/20"
                placeholder="Tell us about your experience"
              />
              <div className="mt-4 flex gap-3">
                <button type="submit" className="rounded-full bg-[#07875f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#066f50]">Submit review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-full border border-[#cfd8d2] px-5 py-2.5 text-sm font-semibold">Cancel</button>
              </div>
            </form>
          )}
        </section>

        <section className="mx-auto mt-9 max-w-3xl border-t border-[#dce4de] pt-8">
          <h2 className="text-xl font-black">What&apos;s new</h2>
          <p className="mt-3 text-[15px]">Bug fixes and feature improvements</p>
          <a
            href="mailto:info@shilingibet.com?subject=Report%20ShilingiBet%20app"
            className="mt-6 flex items-center gap-3 py-2 font-semibold hover:text-[#087f5b]"
          >
            <Flag size={19} /> Flag as inappropriate
          </a>
        </section>

        <section className="mx-auto mt-5 max-w-3xl border-t border-[#dce4de] pt-6">
          <h2 className="flex items-center justify-between text-xl font-black">
            App support <ChevronUp size={20} />
          </h2>

          <div className="mt-5 space-y-5 text-[15px]">
            <a href="https://www.shilingibet.com" className="flex items-start gap-3 hover:text-[#087f5b]">
              <Globe2 className="mt-0.5 shrink-0 text-[#667085]" size={19} />
              <span className="font-semibold">Website</span>
            </a>
            {/* <a href="tel:0800724835" className="flex items-start gap-3 hover:text-[#087f5b]">
              <Phone className="mt-0.5 shrink-0 text-[#667085]" size={19} />
              <span><strong className="font-semibold">Phone number</strong><br /><span className="text-sm">0800 724 835</span></span>
            </a> */}
            <a href="mailto:info@shilingibet.com" className="flex items-start gap-3 hover:text-[#087f5b]">
              <Mail className="mt-0.5 shrink-0 text-[#667085]" size={19} />
              <span><strong className="font-semibold">Support email</strong><br /><span className="text-sm">info@shilingibet.com</span></span>
            </a>
            <a href="/legal#privacy" className="flex items-start gap-3 hover:text-[#087f5b]">
              <ShieldCheck className="mt-0.5 shrink-0 text-[#667085]" size={19} />
              <span className="font-semibold">Privacy Policy</span>
            </a>
          </div>

          <div className="mt-6 text-[15px] leading-6">
            <h3 className="font-semibold">About the developer</h3>
            <p className="mt-1 text-[#526057]">
              Telora Technologies Limited<br />
              info@shilingibet.com<br />
              Kenya
            </p>
          </div>
        </section>

        <footer className="mx-auto mt-8 max-w-3xl border-t border-[#dce4de] pb-20 pt-7 text-sm">
          <div className="grid grid-cols-2 gap-8 leading-8">
            <div className="flex flex-col">
              <a href="/" className="font-semibold hover:text-[#087f5b]">ShilingiBet</a>
              <a href="/promotions" className="hover:text-[#087f5b]">Promotions</a>
              <a href="/jackpot" className="hover:text-[#087f5b]">Jackpots</a>
              <a href="/support" className="hover:text-[#087f5b]">Help centre</a>
              <a href="/support" className="hover:text-[#087f5b]">Responsible gaming</a>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Support</span>
              <a href="/legal#terms" className="hover:text-[#087f5b]">Terms of Service</a>
              <a href="/legal#privacy" className="hover:text-[#087f5b]">Privacy</a>
              <a href="/support" className="hover:text-[#087f5b]">Contact us</a>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[#657168]">
            <a href="/legal#terms" className="hover:text-[#087f5b]">Terms of Service</a>
            <a href="/legal#privacy" className="hover:text-[#087f5b]">Privacy</a>
            <a href="/support" className="hover:text-[#087f5b]">About ShilingiBet</a>
          </div>
          <p className="mt-5 text-[#657168]">Kenya (English)</p>
          <p className="mt-4 text-xs text-[#68746c]">ShilingiBet is for adults aged 18 and over. Play responsibly.</p>

          <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[480px] grid-cols-3 border-t border-[#dce4de] bg-white py-2 text-center shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
            <a href="/" className="flex flex-col items-center gap-1 text-xs text-[#667085]"><Gamepad2 size={21} />Games</a>
            <a href="/download" className="flex flex-col items-center gap-1 text-xs font-semibold text-[#087f5b]"><Grid3X3 size={21} />Apps</a>
            <a href="/support" className="flex flex-col items-center gap-1 text-xs text-[#667085]"><Star size={21} />Support</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
