"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Linkedin, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isArticlesPage = pathname === "/articles";
  const isArticleDetail = pathname?.startsWith("/articles/") && pathname !== "/articles";
  const isMap = pathname === "/map";

  // Use simple footer for Landing, Articles list, Article Detail, and Map
  if (isLanding || isArticlesPage || isArticleDetail || isMap) {
    return (
      <div id="footer">
        <hr className="border-t border-[#c8c6d8] opacity-50" />
        <footer className="w-full px-[5%] md:px-[8%] py-6 md:py-8 box-border flex flex-col md:flex-row justify-between items-center gap-[16px] md:gap-[20px]" style={{ background: "rgba(237, 236, 255, 1)", fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%", letterSpacing: "0%", textAlign: "center", color: "rgba(89, 89, 89, 1)" }}>
          <div className="flex flex-col md:flex-row items-center gap-[10px] md:gap-[20px]">
            <div>© 2026 NITT. All rights reserved.</div>
            <div className="flex gap-[15px] text-[1rem] items-center">
              <Link href="https://www.linkedin.com/company/technical-council-nit-trichy/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2d2d2d] transition-colors"><Linkedin className="w-4 h-4" /></Link>
              <Link href="mailto:contact@nitt.edu" className="hover:text-[#2d2d2d] transition-colors"><Mail className="w-4 h-4" /></Link>
            </div>
          </div>
          <Link href="mailto:contact@nitt.edu" className="font-medium transition-colors hover:text-[#333] flex items-center gap-2">Contact Us <ExternalLink className="w-5 h-5" /></Link>
        </footer>
      </div>
    );
  }

  return (
    <footer className="w-full mt-auto bg-slate-50 border-t border-border-light pt-16 pb-8">
      {/* ... standard directory footer code ... */}
    </footer>
  );
}