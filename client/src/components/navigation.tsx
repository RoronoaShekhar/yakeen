import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

// Assume Button component is imported from a UI library or defined elsewhere
// For the purpose of this example, we'll assume it exists and has the expected props.
// If Button is not globally available, you'd need to import it like:
// import Button from './Button'; // or wherever your Button component is located

function Button({ children, className, ...props }) {
  // This is a placeholder for a Button component.
  // In a real application, this would be a more sophisticated component.
  return (
    <button className={`py-2 px-4 rounded-md font-semibold ${className}`} {...props}>
      {children}
    </button>
  );
}


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
    <nav className="glass-effect border-b border-white/20 sticky top-0 z-50 shadow-lg">
      <div className="px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold text-gradient-primary group-hover:scale-105 transition-transform duration-300 truncate">
              NEET Study Hub
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/subjects"
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative group"
            >
              Subjects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/schedule"
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative group"
            >
              Schedule
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="text-gray-600" />
            ) : (
              <Menu className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {/* Add a button for mobile menu */}
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mt-4">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}