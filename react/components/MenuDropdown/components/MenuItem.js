import React from "react";
import { classGenerator } from "../../../utils/classGenerator";

export function MenuItem({ item, isActive, onMouseEnter, emphasis }) {
    const menuItemClass = classGenerator("vtex-menu-dropdown", "menu-item");
    const activeClass = isActive ? classGenerator("vtex-menu-dropdown", "menu-item-active") : "";
    const emphasisClass = emphasis ? classGenerator("vtex-menu-dropdown", "menu-item-emphasis") : "";

    return (
        <li
            className={`${menuItemClass} ${activeClass} ${emphasisClass}`}
            onMouseEnter={() => onMouseEnter(item.id)}
        >
            {item.label}
        </li>
    )
}