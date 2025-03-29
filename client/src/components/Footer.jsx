import React from "react";
import Logo from "./Logo";

const Footer = () => {
  const footerLinks = [
    { name: "Contact Us", href: "#" },
    { name: "Feedback", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Community", href: "#" },
    { name: "FAQ", href: "#" },
  ];

  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-8 flex justify-between items-start">
        {/* Left Section: Logo and Copyright */}
        <div>
          <Logo className="text-xl mb-2" />
          <p className="text-gray-600">© 2025 studysync Inc.</p>
        </div>

        {/* Right Section: Footer Links in Groups of 3 */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-right">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-600 hover:text-black transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
