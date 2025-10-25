import React from "react";
import { classGenerator } from "../../../utils/classGenerator";

export function BannerImage({ src, alt }) {
    const imageClass = classGenerator("vtex-menu-dropdown", "banner-image");

    return (
        <div className={imageClass}>
            <img src={src} alt={alt} />
        </div>
    );
}