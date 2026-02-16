import Link from 'next/link';
import { Ticket } from 'lucide-react';

export function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-zinc-900 py-44">
            {/* Background gradients */}
            <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20"
            />
            <div
                className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-zinc-900 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"
            />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        Book Your Best Moment
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-zinc-300">
                        Secure your seats for the hottest concerts, theater shows, and events.
                        Experience the thrill of live performance with easy, instant booking.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Link
                            href="#upcoming-events"
                            className="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
                        >
                            <Ticket className="w-4 h-4" />
                            Browse Events
                        </Link>
                        <Link href="/register" className="text-sm font-semibold leading-6 text-white">
                            Create account <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
