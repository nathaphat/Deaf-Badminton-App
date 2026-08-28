import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full text-center py-6 mt-10">
      <p className="text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} Deaf Badminton. All rights reserved.
      </p>
      <p className="text-xs text-gray-500 font-bold mt-1">
        Developed By <span className="text-blue-500">Nathaphat Tianthong</span>
      </p>
    </footer>
  );
};

export default Footer;
