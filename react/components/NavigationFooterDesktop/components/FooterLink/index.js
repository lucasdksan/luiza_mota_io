import React from "react";
import { classGenerator } from "../../../../utils/classGenerator";

function FooterLink({ text, href, onClick }) {
  const linkClass = classGenerator("vtex-navigation-footer-desktop", "link");

  return (
    <a 
      href={href} 
      className={linkClass}
      onClick={onClick}
    >
      {text}
    </a>
  );
}

export default FooterLink;
