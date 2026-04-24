import { Heart, Sun, Truck, UtensilsCrossed } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function Features() {
  const items = [
    {
      title: "Baked Daily",
      description: "Baked fresh every morning at 4 AM.",
      icon: Sun,
      color: "bg-amber-100 text-amber-700",
      hover: "hover:bg-amber-50/80 hover:border-amber-200",
    },
    {
      title: "Artisanal Craft",
      description: "Traditional slow-fermentation.",
      icon: UtensilsCrossed,
      color: "bg-rose-100 text-rose-700",
      hover: "hover:bg-rose-50/80 hover:border-rose-200",
    },
    {
      title: "Made with Love",
      description: "Honest, locally sourced ingredients.",
      icon: Heart,
      color: "bg-orange-100 text-orange-700",
      hover: "hover:bg-orange-50/80 hover:border-orange-200",
    },
    {
      title: "Fast Delivery",
      description: "Warm treats delivered to your door.",
      icon: Truck,
      color: "bg-sky-100 text-sky-700",
      hover: "hover:bg-sky-50/80 hover:border-sky-200",
    },
  ];

  return (
    <ScrollReveal className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-[#4D321E]">The Crumbs Experience</h2>
        <p className="mt-2 text-[#7A5D4B]">Why our customers keep coming back for more</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={[
              "group rounded-3xl border border-amber-100/50 bg-white p-5 transition-all hover:shadow-lg hover:shadow-amber-900/5",
              item.hover,
              i === 0 ? "delay-100" : i === 1 ? "delay-200" : i === 2 ? "delay-300" : "delay-400"
            ].join(" ")}
          >
            <div
              className={[
                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3",
                item.color,
              ].join(" ")}
            >
              <item.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#4D321E]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#7A5D4B]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
