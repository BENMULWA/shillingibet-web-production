import Header from "./Header";
import HelpItem from "./HelpItem";
import MessageCard from "./MessageCard";

const popularTopics = [
  {
    label: "How do I deposit funds?",
    answer:
      "To deposit funds, go to your Profile and tap 'Deposit'. Enter an amount between KES 1 and KES 250,000 or select a preset amount. Complete the M-Pesa payment and your funds will appear in your wallet.",
  },
  {
    label: "How do I withdraw my winnings?",
    answer:
      "Go to Profile → Withdraw. Your M-Pesa number is pre-filled. Enter an amount from KES 10 to KES 250,000, up to your withdrawable balance. Bonus funds cannot be withdrawn directly.",
  },
  {
    label: "How does the Refer & Earn program work?",
    answer:
      "Share your unique referral link from your Profile. When a referred friend registers and verifies their phone, you receive a KES 5 betting bonus after security checks. Referral and welcome bonuses cannot be withdrawn directly.",
  },
  {
    label: "What games are available?",
    answer:
      "We offer Aviator (crash game by Spribe), Crash games from multiple providers, Slots, Roulette, and Casino games. Browse all games from the homepage or use the search feature.",
  },
];

export default function HomeScreen({ onStartChat }) {
  return (
    <div className="home-screen">
      <Header />

      <MessageCard onStartChat={onStartChat} />

      <div className="home-topics">
        <p className="home-topics-title">Popular topics</p>
        <div className="home-topics-list">
          {popularTopics.map((topic, index) => (
            <HelpItem key={index} label={topic.label} answer={topic.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
