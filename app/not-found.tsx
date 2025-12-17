import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-[150px] pb-20">
        <div className="max-w-[1440px] mx-auto px-5">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h1 className="text-6xl font-montserrat-bold text-[#5260ce] mb-4">404</h1>
            <h2 className="text-3xl font-montserrat-bold text-[#121c67] mb-4">
              Page Not Found
            </h2>
            <p className="text-lg font-montserrat-regular text-[#65666f] mb-8 max-w-md">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
              >
                <Link href="/">Go Home</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-montserrat-semibold"
              >
                <Link href="/universities">Browse Universities</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}




