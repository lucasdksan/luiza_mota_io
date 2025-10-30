import React from "react";
import { classGenerator } from "../../../utils/classGenerator";
import { MenuItem } from "./MenuItem";

export function MenuHeader({ menuItems, activeItem, onMouseEnter }) {
    const headerClass = classGenerator("vtex-menu-dropdown", "header");

    return (
        <ul className={headerClass}>
            {menuItems.map((item) => (
                <MenuItem
                    key={item.id}
                    item={item}
                    isActive={activeItem === item.id}
                    onMouseEnter={onMouseEnter}
                    emphasis={item.emphasis}
                />
            ))}
        </ul>
    );
}