import React from "react";
import { classGenerator } from "../../../utils/classGenerator";

export function MenuItem({ item, isActive, onMouseEnter }) {
    const menuItemClass = classGenerator("vtex-menu-dropdown", "menu-item");
    const activeClass = isActive ? classGenerator("vtex-menu-dropdown", "menu-item-active") : "";

    return (
        <li
            className={`${menuItemClass} ${activeClass}`}
            onMouseEnter={() => onMouseEnter(item.id)}
        >
            {item.label}
        </li>
    )
}