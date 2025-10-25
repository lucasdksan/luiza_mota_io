import React, { useState, useRef } from "react";
import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";
import { MenuDropdownContent } from "./components/MenuDropdownContent";
import { MenuHeader } from "./components/MenuHeader";

function MenuDropdown({ menuItems = [], VtexFlexLayout }) {
    const [activeItem, setActiveItem] = useState(null);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);
    const containerClass = classGenerator("vtex-menu-dropdown", "container");

    const handleMouseEnter = (itemId) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveItem(itemId);
    }

    const handleContainerMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveItem(null);
        }, 200);
    }

    const handleContainerMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }

    return (
        <VtexFlexLayout>
            <nav
                ref={containerRef}
                className={containerClass}
                onMouseEnter={handleContainerMouseEnter}
                onMouseLeave={handleContainerMouseLeave}
            >
                <MenuHeader
                    menuItems={menuItems}
                    activeItem={activeItem}
                    onMouseEnter={handleMouseEnter}
                />
                <MenuDropdownContent
                    activeItem={activeItem}
                    menuItems={menuItems}
                />
            </nav>
        </VtexFlexLayout>
    )
}

MenuDropdown.schema = schema;

export default MenuDropdown;