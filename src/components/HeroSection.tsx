import Link from "next/link";
import { Ticket } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-zinc-900 py-44 min-h-[80vh] flex items-center">
      {/* 1. Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        {/* อ้างอิง Path จากโฟลเดอร์ public */}
        <source src="/video/Background_video.mp4" type="video/mp4" />
      </video>

      {/* 2. Blur & Dark Overlay (ฟิล์มกรองแสงและลดความคมชัด) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"></div>

      {/* 3. Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Book Your Best Moment
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            Secure your seats for the hottest concerts, theater shows, and
            events. Experience the thrill of live performance with easy, instant
            booking.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="#upcoming-events"
              className="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2 transition-colors duration-200"
            >
              <Ticket className="w-4 h-4" />
              Browse Events
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold leading-6 text-white hover:text-zinc-300 transition-colors duration-200"
            >
              Create account <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
