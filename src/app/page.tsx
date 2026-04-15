"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", alt: "New York City" },
  { src: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80", alt: "Los Angeles" },
  { src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", alt: "Golden Gate Bridge" },
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", alt: "Road trip" },
  { src: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80", alt: "Skiing in Vail" },
  { src: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80", alt: "San Francisco" },
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "" }: { children: React.ReactNode; delay?: number; from?: "left" | "right"; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: from === "left" ? -60 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });
  useEffect(() => {
    return scrollYProgress.on("change", (v) => setCount(Math.round(v * value)));
  }, [scrollYProgress, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ──────────────────────────────────────────────────────────────────────────
   HERO — Wispr-style: huge serif text, warm bg, immersive
   ────────────────────────────────────────────────────────────────────────── */
const HERO_WORDS = ["beautifully", "elegantly", "completely"] as const;

function HeroSection() {
  const { data: session, status } = useSession();
  const [wordIdx, setWordIdx] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % HERO_WORDS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF7F2] dark:bg-[#0a0a0a]">
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="font-display tracking-tight text-[#1a1a1a] dark:text-white" style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)", lineHeight: 1.0, fontWeight: 400 }}>
          <span className="block">Your life,</span>
          <span className="block">
            <span className="inline-block relative align-bottom overflow-visible" style={{ lineHeight: "inherit", paddingRight: "0.08em" }}>
              <span className="invisible italic">beautifully</span>
              <AnimatePresence mode="wait">
                <motion.span key={HERO_WORDS[wordIdx]} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 italic text-chrono-accent text-right" style={{ lineHeight: "inherit" }}>
                  {HERO_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            <span style={{ fontWeight: 800 }}>mapped</span>
          </span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="text-lg md:text-xl font-body max-w-md mx-auto leading-relaxed text-[#1a1a1a]/50 dark:text-white/50 mt-8">
          The visual timeline that turns your memories into clear, beautiful stories.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-9 py-4 text-sm font-body font-bold tracking-wide hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            Get Started <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
          <Link href="/insights" className="px-8 py-4 text-[#1a1a1a]/60 dark:text-white/60 hover:text-[#1a1a1a] dark:hover:text-white border border-black/10 dark:border-white/15 hover:border-black/25 dark:hover:border-white/30 rounded-full transition-all text-sm font-body font-medium">
            View Insights
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PHOTO BENTO — Clean grid with parallax
   ────────────────────────────────────────────────────────────────────────── */
function PhotoSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -70]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-6 overflow-hidden bg-[#FAF7F2] dark:bg-[#0a0a0a]">
      <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-display tracking-tight text-[#1a1a1a] dark:text-white" style={{ fontWeight: 500 }}>
          <em className="italic">Every moment</em> deserves<br />a beautiful canvas
        </h2>
      </FadeUp>
      <div className="max-w-6xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[220px]">
        {PHOTOS.slice(0, 4).map((photo, i) => {
          const spans = ["col-span-2 md:col-span-5 row-span-2", "col-span-2 md:col-span-4 row-span-1", "col-span-2 md:col-span-3 row-span-2", "col-span-2 md:col-span-4 row-span-1"];
          return (
            <motion.div key={photo.alt} style={{ y: i % 2 === 0 ? y1 : y2 }} whileHover={{ scale: 1.03 }} className={`relative ${spans[i]} rounded-[1.2rem] overflow-hidden cursor-pointer group`}>
              <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" sizes="(max-width:768px) 50vw, 33vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              <span className="absolute bottom-4 left-5 text-white text-sm font-display" style={{ fontWeight: 600 }}>{photo.alt}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   FEATURES — Full-width dark card per feature, Apple-style
   ────────────────────────────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    { title: "Timeline", desc: "Every moment organized chronologically — a living record that grows with you.", photo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80" },
    { title: "Life Stories", desc: "Narratives crafted from your real experiences. Your story, told beautifully.", photo: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80" },
    { title: "Life Map", desc: "See where your life happened — every pin is a memory on an interactive globe.", photo: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80" },
    { title: "Insights", desc: "Discover patterns you never saw — most active years, favorite places, milestones.", photo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80" },
  ];

  return (
    <section className="relative py-24 md:py-40 px-6 bg-[#111] text-white">
      <FadeUp className="text-center mb-20 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-display tracking-tight" style={{ fontWeight: 500 }}>
          Everything you need
        </h2>
        <p className="text-base md:text-lg font-body text-white/40 mt-6">Four powerful features, one beautiful app.</p>
      </FadeUp>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <FadeUp key={f.title} delay={i * 0.1}>
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="group rounded-[1.5rem] overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full">
              <div className="relative h-48 md:h-56 overflow-hidden">
                <Image src={f.photo} alt={f.title} fill className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" sizes="50vw" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent" />
              </div>
              <div className="p-7 md:p-9">
                <h3 className="text-2xl md:text-3xl font-display tracking-tight mb-3" style={{ fontWeight: 700 }}>{f.title}</h3>
                <p className="text-sm md:text-base font-body leading-relaxed text-white/45">{f.desc}</p>
              </div>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   HOW IT WORKS — Cream bg, big numbers, side photos
   ────────────────────────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const steps = [
    { num: "01", title: "Add your memories", desc: "Import from Google Photos, connect your calendar, or add events manually." },
    { num: "02", title: "Watch it come alive", desc: "See your life organized with maps, chapters, and interactive insights." },
    { num: "03", title: "Discover your story", desc: "Narratives crafted from your life chapters — your story, told right." },
  ];

  return (
    <section ref={ref} className="relative py-28 md:py-48 px-6 overflow-hidden bg-[#FAF7F2] dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <FadeUp>
            <h2 className="text-4xl md:text-6xl font-display tracking-tight text-[#1a1a1a] dark:text-white mb-16" style={{ fontWeight: 500 }}>How it <em>works</em></h2>
          </FadeUp>
          {steps.map((s, i) => (
            <SlideIn key={s.num} delay={i * 0.15} from="left">
              <div className="flex gap-6 mb-14">
                <span className="text-6xl md:text-7xl font-display text-chrono-accent/20 leading-none shrink-0" style={{ fontWeight: 800 }}>{s.num}</span>
                <div className="pt-2">
                  <h3 className="text-xl md:text-2xl font-display text-[#1a1a1a] dark:text-white mb-2" style={{ fontWeight: 600 }}>{s.title}</h3>
                  <p className="text-sm md:text-base font-body text-[#1a1a1a]/45 dark:text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
        <motion.div style={{ y: imgY }} className="relative hidden md:block">
          <div className="grid grid-cols-2 gap-5">
            <div className="relative aspect-[3/4] rounded-[1.2rem] overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="Memory" fill className="object-cover" unoptimized />
            </div>
            <div className="relative aspect-[3/4] rounded-[1.2rem] overflow-hidden shadow-2xl mt-16">
              <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" alt="Memory" fill className="object-cover" unoptimized />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PHOTO STRIP — Two rows, scroll-driven horizontal motion
   ────────────────────────────────────────────────────────────────────────── */
function PhotoStripSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-15%", "5%"]);
  const allPhotos = [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=600&q=80",
  ];
  return (
    <section ref={ref} className="relative py-6 md:py-10 overflow-hidden bg-[#111] space-y-4">
      {[x1, x2].map((x, row) => (
        <motion.div key={row} style={{ x }} className="flex gap-4 px-4">
          {allPhotos.slice(row * 6, row * 6 + 6).map((src, i) => (
            <motion.div key={i} whileHover={{ scale: 1.04 }} className="relative w-[260px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden shrink-0">
              <Image src={src} alt={`Memory ${row * 6 + i + 1}`} fill className="object-cover" sizes="340px" unoptimized />
            </motion.div>
          ))}
        </motion.div>
      ))}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   STATS — Clean grid on cream bg
   ────────────────────────────────────────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="relative py-24 md:py-36 px-6 bg-[#FAF7F2] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.06] dark:bg-white/[0.06] rounded-[1.5rem] overflow-hidden">
          {[
            { value: 10, suffix: "k+", label: "Memories" },
            { value: 50, suffix: "+", label: "Cities" },
            { value: 365, suffix: "", label: "Days" },
            { value: 100, suffix: "%", label: "Private" },
          ].map((stat, i) => (
            <ScaleIn key={stat.label} delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.04 }} className="text-center p-8 md:p-14 bg-[#FAF7F2] dark:bg-[#0a0a0a] cursor-default">
                <div className="text-4xl md:text-6xl font-display text-[#1a1a1a] dark:text-white mb-2" style={{ fontWeight: 800 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] font-body font-bold text-[#1a1a1a]/30 dark:text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MADE FOR YOU — Wispr Flow-style dark rounded card
   ────────────────────────────────────────────────────────────────────────── */
function MadeForYouSection() {
  const pills = ["Travelers", "Students", "Professionals", "Creatives", "Parents", "Athletes", "Journalers", "Everyone"];
  return (
    <section className="relative py-20 md:py-32 px-6 bg-[#FAF7F2] dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <ScaleIn>
          <div className="bg-[#1a1a1a] dark:bg-white/[0.04] rounded-[2rem] p-10 md:p-16">
            <h2 className="text-4xl md:text-6xl font-display tracking-tight text-white mb-10" style={{ fontWeight: 500 }}>
              Crohna is made<br /><em className="text-white/40">for you</em>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {pills.map((pill, i) => (
                <motion.span key={pill} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.1)" }} className="px-5 py-2.5 rounded-full border border-white/15 text-white/60 hover:text-white text-sm font-body font-medium cursor-default transition-all duration-300">
                  {pill}
                </motion.span>
              ))}
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CTA — Dark, immersive, simple
   ────────────────────────────────────────────────────────────────────────── */
function CTASection() {
  const { data: session, status } = useSession();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative py-32 md:py-56 px-6 overflow-hidden bg-[#111]">
      <motion.div style={{ scale }} className="relative max-w-3xl mx-auto text-center">
        <FadeUp>
          <h2 className="font-display tracking-tight mb-8 text-white" style={{ fontSize: "clamp(3rem, 9vw, 7rem)", lineHeight: 1.0, fontWeight: 500 }}>
            Ready to map<br /><em className="text-white/40">your story?</em>
          </h2>
          <p className="text-lg font-body max-w-md mx-auto mb-14 leading-relaxed text-white/35">Transform your memories into a beautiful, interactive timeline.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full px-10 py-4 text-base font-body font-bold bg-white text-[#111] hover:bg-white/90 shadow-[0_4px_30px_rgba(255,255,255,0.1)] transition-colors">
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <Link href="/insights" className="px-10 py-4 text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-full transition-all text-sm font-body font-medium">See a Demo</Link>
          </div>
          <p className="mt-16 text-xs font-body font-medium text-white/20 tracking-wide">Free to start &middot; No credit card &middot; Your data stays private</p>
        </FadeUp>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />
      <PhotoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PhotoStripSection />
      <StatsSection />
      <MadeForYouSection />
      <CTASection />
    </>
  );
}
