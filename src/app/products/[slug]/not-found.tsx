import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-20">
        <p className="font-sans text-2xl text-[#121212]">Product not found</p>
        <p className="mt-2 text-sm text-[#121212]/50">
          The piece you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-none tracking-[0.1em] uppercase"
          asChild
        >
          <Link href="/products">Back to Collection</Link>
        </Button>
      </div>
      <Footer />
    </div>
  );
}
