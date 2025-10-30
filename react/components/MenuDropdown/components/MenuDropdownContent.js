import React from "react";
import { classGenerator } from "../../../utils/classGenerator";
import { BannerSection } from "./BannerSection";
import { CategorySection } from "./CategorySection";

export function MenuDropdownContent({ activeItem, menuItems }) {
    const contentClass = classGenerator("vtex-menu-dropdown", "dropdown-content");

    if (!activeItem) return null;

    const currentItem = menuItems.find(item => item.id === activeItem);

    if (!currentItem) return null;

    if(currentItem.categories.length === 0) return null;

    return (
        <div className={contentClass}>
            {currentItem.categories.map((category, index) => (
                <CategorySection key={index} category={category} />
            ))}
            <BannerSection bannerImages={currentItem.bannerImages} />
        </div>
    );
}