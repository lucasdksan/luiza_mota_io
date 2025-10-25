import React from "react";
import { classGenerator } from "../../../../utils/classGenerator";
import FooterLink from "../FooterLink";

function FooterLinkList({ links = [] }) {
  const linkListClass = classGenerator("vtex-navigation-footer-desktop", "link-list");
  const linkListColumnsClass = classGenerator("vtex-navigation-footer-desktop", "link-list__column");

  if (!links.length) return null;

  const chunkedLinks = [];

  for (let i = 0; i < links.length; i += 6) {
    chunkedLinks.push(links.slice(i, i + 6));
  }

  return (
    <div className={`${linkListClass} ${classGenerator("vtex-navigation-footer-desktop", "link-list--columns")}`}>
      {chunkedLinks.map((chunk, columnIndex) => (
        <div key={columnIndex} className={linkListColumnsClass}>
          {chunk.map((link, index) => (
            <FooterLink
              key={index}
              text={link.text}
              href={link.href}
              onClick={link.onClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default FooterLinkList;
