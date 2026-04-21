import Navbar from "@/components/reusable/Navbar";
import Footer from "@/components/reusable/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      {/* <Footer /> */}
    </>
  );
}