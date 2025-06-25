import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center">
      {/* Background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse absolute -top-20 -left-20 w-64 h-32 opacity-10"></div>
        <div className="flowing-ellipse-alt absolute top-1/4 -right-32 w-48 h-72 opacity-8"></div>
        <div className="flowing-ellipse absolute bottom-10 left-1/4 w-56 h-28 opacity-12"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/assets/images/logo-vertical.png"
            alt="Fred AI"
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>

        {/* Description */}
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
        Busy minds need quiet moments. Fred makes space for reflection so you can be the best founder you can be.
        </p>

        {/* CTA Button */}
        <Link 
          href="/home"
          className="inline-block bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Talk to Fred
        </Link>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mt-6">
          On Limited Release until July 2, 2025.
        </p>
      </div>
    </div>
  );
} 