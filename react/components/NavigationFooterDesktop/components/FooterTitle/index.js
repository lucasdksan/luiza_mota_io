import React from "react";
import { classGenerator } from "../../../../utils/classGenerator";

function FooterTitle({ text }) {
  const titleClass = classGenerator("vtex-navigation-footer-desktop", "title");

  return (
    <h3 className={titleClass}>
      {text}
    </h3>
  );
}

export default FooterTitle;
