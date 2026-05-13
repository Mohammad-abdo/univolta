import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9fafe]">
      <Navbar />
      <main className="pt-[100px] md:pt-[150px] pb-20 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(82,96,206,0.08) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(117,211,247,0.1) 0%, transparent 65%)" }} />

        <div className="max-w-[1440px] mx-auto px-5">
          <div className="flex flex-col items-center justify-center text-center py-16">
            {/* Animated 404 */}
            <div className="relative mb-6">
              <h1 className="text-[120px] md:text-[180px] font-montserrat-bold leading-none text-gradient-brand animate-404 select-none">
                404
              </h1>
              {/* Floating dots decoration */}
              <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full bg-[#75d3f7] animate-float" />
              <div className="absolute top-8 -left-6 w-3 h-3 rounded-full bg-[#5260ce]/60 animate-float" style={{ animationDelay: "0.4s" }} />
              <div className="absolute bottom-4 right-8 w-2 h-2 rounded-full bg-[#5260ce]/40 animate-float" style={{ animationDelay: "0.8s" }} />
            </div>

            <div className="animate-fade-up-d100">
              <h2 className="text-2xl md:text-4xl font-montserrat-bold text-[#121c67] mb-4">
                Page Not Found
              </h2>
              <p className="text-base md:text-lg font-montserrat-regular text-[#65666f] mb-10 max-w-md mx-auto leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-d200">
              <Button
                asChild
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold px-8 h-12 rounded-xl shadow-[0_4px_16px_rgba(82,96,206,0.3)] hover:shadow-[0_6px_24px_rgba(82,96,206,0.4)] transition-all"
              >
                <Link href="/en" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-montserrat-semibold px-8 h-12 rounded-xl border-2 border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce]/5 hover:border-[#5260ce] transition-all"
              >
                <Link href="/en/universities" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse Universities
                </Link>
              </Button>
            </div>

            {/* Decorative grid pattern */}
            <div className="mt-16 grid grid-cols-5 gap-3 opacity-20 animate-fade-up-d300">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i % 3 === 0 ? "bg-[#5260ce]" : i % 3 === 1 ? "bg-[#75d3f7]" : "bg-[#121c67]"}`} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
