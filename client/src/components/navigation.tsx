import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";


export default function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", id: "home" },
    { href: "#live", label: "Live Lectures", id: "live" },
    { href: "#recorded", label: "Recorded", id: "recorded" },
    { href: "#progress", label: "Progress", id: "progress" },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-md shadow-lg shadow-gray-100/50 sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl heading-primary text-gradient-primary">NEET Study Hub</h1>
              <p className="text-xs text-gray-500">Your Path to Success</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-body hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="text-gray-600" />
              ) : (
                <Menu className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 text-body hover:text-primary hover:bg-gray-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
