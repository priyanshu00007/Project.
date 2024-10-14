'use client'; // Use client directive for real-time fetching

import { useState, useRef, useEffect } from "react";
import axios from "axios"; // Import axios for API requests
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Bookmark, Share2, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

export default function TazzaKhabar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [likedArticles, setLikedArticles] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newsData, setNewsData] = useState([]); // For fetched news data
  const cardsRef = useRef([]);
  const audioRef = useRef(null); // Ref for audio element
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message

  // API fetching for news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const apiKey = "72937b1fe13f48e698722116a3de47de"; // Using the environment variable
        const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
        const response = await axios.get(url);
        setNewsData(response.data.articles); // Assuming `articles` is the array from API response
        setIsLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching news:", error);
        setIsLoading(false);
      }
    };

    fetchNewsData(); // Fetch news on component mount
  }, []);

  // Code for lazy-loading card animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
          } else {
            entry.target.style.opacity = "0";
            entry.target.style.transform = "translateX(-20px)";
          }
        });
      },
      { threshold: 0.5 }
    );

    cardsRef.current.forEach((card) => card && observer.observe(card));

    return () => observer.disconnect();
  }, [newsData]); // Trigger effect when `newsData` changes

  // Filtering news based on category and search term
  const filteredNews = newsData.filter(
    (article) =>
      (selectedCategory === "All" || article.category === selectedCategory) &&
      (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle likes, bookmarks, shares, and other actions
  const handleLike = (id) => {
    setLikedArticles((prev) =>
      prev.includes(id)
        ? prev.filter((articleId) => articleId !== id)
        : [...prev, id]
    );
  };

  const handleBookmark = (id) => {
    setBookmarkedArticles((prev) =>
      prev.includes(id)
        ? prev.filter((articleId) => articleId !== id)
        : [...prev, id]
    );
  };

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.content,
        url: window.location.href,
      });
    } else {
      alert("Sharing is not supported on this browser");
    }
  };

  // Handle login, signup, and logout functionality
  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => {
      const newEnabledState = !prev;
      if (newEnabledState) {
        setNotificationMessage("Notifications are now enabled!");
        audioRef.current.play(); // Play notification sound
      } else {
        setNotificationMessage(""); // Clear notification message
      }
      return newEnabledState;
    });
  };

  // Show loading screen until news data is fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl font-bold text-orange-500 mb-4"
        >
          Tazza Khabar
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-orange-700"
        >
          Khabar wakt se pehle milegi
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tazza Khabar</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-orange-600 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
               disabled />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200" />
            </div>
            <div className="flex items-center space-x-2">
              <Bell className={`h-5 w-5 ${notificationsEnabled ? "text-green-400" : "text-white"}`} />
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={username} />
                      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log In / Sign Up</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList>
                      <TabsTrigger value="login">Log In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-2">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Log In
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-2">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Sign Up
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Top News</h2>
        <ScrollArea className="h-[70vh]">
          {filteredNews.map((article, index) => (
            <motion.div
              ref={(el) => (cardsRef.current[index] = el)}
              key={article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg mb-4 p-4 flex flex-col"
            >
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="text-sm text-gray-600">{article.content}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLike(article.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        likedArticles.includes(article.id)
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(article.id)}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${
                        bookmarkedArticles.includes(article.id)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(article)}
                  >
                    <Share2 className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </ScrollArea>

        {/* Notification Message */}
        {notificationMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg">
            {notificationMessage}
          </div>
        )}

        {/* Audio Element for Notification Sound */}
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      </main>
    </div>
  );
}
