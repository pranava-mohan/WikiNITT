"use client";

import Link from "next/link";
import LogoIcon from "@/components/logo.svg";
import Github from "@/components/github.svg";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link
            href="https://github.com/pranava-mohan/wikinitt"
            target="_blank"
            className="text-gray-400 hover:text-gray-500 flex item-center gap-2"
          >
            GitHub
            <Github className="h-6 w-6" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <LogoIcon className="h-8 w-8 mr-2 fill-white bg-blue-900 rounded-md p-1.5" />
            <span className="self-center text-xl font-bold whitespace-nowrap text-blue-900">
              Wiki
            </span>
            <span className="self-center text-xl font-bold whitespace-nowrap text-amber-600">
              NITT
            </span>
          </div>
          <p className="text-center text-xs leading-5 text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} WikiNITT. All rights reserved.
            Built with ❤️ for NITT.
          </p>
        </div>
      </div>
    </footer>
  );
}
