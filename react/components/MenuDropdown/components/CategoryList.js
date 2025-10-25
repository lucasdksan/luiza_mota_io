import React from "react";
import { classGenerator } from "../../../utils/classGenerator";

export function CategoryList({ items }) {
    const listClass = classGenerator("vtex-menu-dropdown", "category-list");
    const itemClass = classGenerator("vtex-menu-dropdown", "category-item");

    return (
        <div className={listClass}>
            {items.map((item, index) => (
                <a key={index} href={item.link} className={itemClass}>
                    {item.name}
                </a>
            ))}
        </div>
    );
}