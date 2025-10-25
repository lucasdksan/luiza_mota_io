import React from "react";
import { classGenerator } from "../../../utils/classGenerator";
import { BannerImage } from "./BannerImage";

export function BannerSection({ bannerImages }) {
    const sectionClass = classGenerator("vtex-menu-dropdown", "banner-section");

    return (
        <div className={sectionClass}>
            {bannerImages.map((banner, index) => (
                <BannerImage key={index} src={banner.src} alt={banner.alt} />
            ))}
        </div>
    );
}