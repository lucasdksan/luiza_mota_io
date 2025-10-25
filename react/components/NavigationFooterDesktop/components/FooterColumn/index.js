import React from "react";
import { classGenerator } from "../../../../utils/classGenerator";
import FooterTitle from "../FooterTitle";
import FooterLinkList from "../FooterLinkList";

function FooterColumn({ title, links }) {
  const columnClass = classGenerator("vtex-navigation-footer-desktop", "column");

  return (
    <div className={columnClass}>
      <FooterTitle text={title} />
      <FooterLinkList links={links} />
    </div>
  );
}

export default FooterColumn;
