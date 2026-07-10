"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, QrCode } from "lucide-react";

interface HeaderProps {
  userSession?: any;
}

export function Header({ userSession }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    if (typeof window !== "undefined") {
      setQrUrl(`${window.location.origin}/walk`);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartWalkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Check if it is a desktop screen
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setShowWalkModal(true);
    } else {
      router.push("/walk");
    }
  };

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300">
        <nav
          className="flex items-center justify-between w-full max-w-2xl h-14 px-8 rounded-full border border-border-subtle bg-white/45 text-text-primary shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-lg transition-all duration-300"
        >
          {/* Left: Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif tracking-wider font-normal text-base text-text-primary group-hover:text-emerald-600 transition-colors duration-300">
              GLYPH
            </span>
          </Link>

          {/* Center: Nav links - Lastik font, NOT bold */}
          <div className="hidden sm:flex items-center gap-8 font-serif font-normal text-sm sm:text-base text-text-secondary">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-text-primary transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#philosophy"
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById("philosophy");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="hover:text-text-primary transition-colors duration-200"
            >
              How It Works
            </a>
            <a
              href="#playground"
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById("playground");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="hover:text-text-primary transition-colors duration-200"
            >
              See an example
            </a>
            <a
              href="https://github.com/ayatinkering/GLYPH"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors duration-200"
            >
              Github
            </a>
          </div>

          {/* Right: Connect / Start Walk */}
          <div className="flex items-center gap-3">
            {userSession ? (
              <span className="text-xs font-mono text-neutral-400 hidden md:inline">
                {userSession.user?.email.split("@")[0]}
              </span>
            ) : null}

            <a
              href="/walk"
              onClick={handleStartWalkClick}
              className="px-5 py-2 text-xs font-serif font-normal rounded-full bg-btn-primary-bg hover:bg-btn-primary-hover text-white tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
            >
              Start Walking
            </a>
          </div>
        </nav>
      </header>

      {/* WALK MODAL: QR Code popup for desktop users */}
      {showWalkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/10 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-[24px] border border-border-subtle bg-[#FAF9F5] p-8 shadow-xl text-center">
            {/* Close button */}
            <button
              onClick={() => setShowWalkModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-200/50 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl text-text-primary mb-4">Scan to start walk</h3>
            
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6 font-serif">
              GLYPH uses phone accelerometer motion sensors to compile your mandala. Scan the code to open the app on your mobile device:
            </p>

            {/* QR Code Specimen Frame */}
            <div className="w-44 h-44 bg-white rounded-2xl border border-border-subtle flex items-center justify-center p-2 mx-auto mb-2 shadow-sm">
              {qrUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0a3323&bgcolor=f8f6e9&data=${encodeURIComponent(qrUrl)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-6 h-6 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
