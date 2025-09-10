import React from "react";

type HeaderProps = {
  children?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white shadow-sm">
  {/* Logo */}
  <div className="flex items-center">
    <img
      src="/logo.svg"
      alt="DeepThought Logo"
      className="h-8 w-auto object-contain"
    />
  </div>

  {/* Right-Side JSX */}
  <div className="flex items-center gap-4">
    {children}
  </div>
</header>

  );
};

export default Header;