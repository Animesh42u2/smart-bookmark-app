"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const router = useRouter();

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div
      className="
        min-h-screen
        transition-all duration-500
        bg-gradient-to-br 
        from-purple-100 via-blue-100 to-indigo-200
        dark:from-gray-900 dark:via-gray-800 dark:to-black
        text-gray-900 dark:text-white
        px-4 sm:px-6 md:px-12
      "
    >
      <div className="flex justify-between items-center py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
            <Image
              src="/logo.jpeg"
              alt="Smart Bookmark Logo"
              fill
              sizes="40px"
              className="object-contain rounded-lg"
              priority
            />
          </div>

          <h1 className="text-lg sm:text-xl font-semibold tracking-wide">
            Smart Bookmark
          </h1>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="
            text-sm sm:text-base
            px-4 py-2
            rounded-xl
            bg-white/60 dark:bg-gray-700
            shadow-md backdrop-blur-md
            hover:scale-105
            transition
          "
        >
          {darkMode ? "🌙 Dark Mode" : "☀ Light Mode"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center text-center mt-20 sm:mt-28 max-w-4xl mx-auto">
        <h2
          className="
    font-bold leading-tight
    text-3xl sm:text-4xl md:text-5xl lg:text-6xl
  "
        >
          <span className="block sm:inline typewriter">
            Save Your Favorite Links
          </span>

          <span className="block sm:inline gradient-text fade-in">
            {" "}
            Beautifully
          </span>
        </h2>

        <p
          className="
          mt-6 
          text-sm sm:text-base md:text-lg
          text-gray-600 dark:text-gray-300
          max-w-md sm:max-w-xl
        "
        >
          Your digital memory, synchronized in real time.{" "}
        </p>

        <button
          onClick={login}
          className="
            mt-8
            flex items-center gap-3
            bg-white/60 dark:bg-gray-700
            px-6 py-3
            rounded-xl
            shadow-lg
            hover:scale-105
            transition-all duration-300
            text-sm sm:text-base
          "
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
