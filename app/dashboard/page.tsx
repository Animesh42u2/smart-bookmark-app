"use client";
import "./dashboard.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  const fetchBookmarks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setBookmarks(data || []);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/";
      } else {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          const fullName = userData.user.user_metadata.full_name;
          const firstName = fullName?.split(" ")[0];
          setUserName(firstName || "");
        }

        fetchBookmarks();
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel("realtime-bookmarks")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
          },
          () => {
            fetchBookmarks();
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const addBookmark = async () => {
    if (!title || !url) return alert("Fill all fields");

    let formattedUrl = url;
    if (!url.startsWith("http")) {
      formattedUrl = "https://" + url;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url: formattedUrl,
        user_id: user.id,
      },
    ]);

    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (!error) {
      setBookmarks((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };
  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <h1>Smart Bookmark App ({bookmarks.length})</h1>

          <div className="header-right">
            <div className="greeting">Hi {userName} 👋</div>

            <div
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="theme-toggle-circle"></div>
            </div>

            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h2>Add Bookmark</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark Title"
              className="input-field"
            />

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field"
            />

            <button onClick={addBookmark} className="primary-btn">
              Add Bookmark
            </button>
          </div>

          <div>
            <div className="bookmark-section-title">Your Bookmarks</div>
            <div className="yt-search-container">
              <input
                type="text"
                placeholder="Search bookmarks..."
                className="yt-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchTerm(searchTerm.trim());
                  }
                }}
              />

              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}

              <button
                className="search-btn"
                onClick={() => setSearchTerm(searchTerm.trim())}
              >
                🔍
              </button>
            </div>

            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="card bookmark-item">
                <div className="bookmark-info">
                  <h3>{bookmark.title}</h3>
                  <a href={bookmark.url} target="_blank">
                    {bookmark.url}
                  </a>
                </div>

                <div className="bookmark-actions">
                  <button
                    onClick={() => handleCopy(bookmark.url)}
                    className="copy-btn"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showToast && <div className="toast">Link copied to clipboard</div>}
    </div>
  );
}
