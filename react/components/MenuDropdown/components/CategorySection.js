import React from "react";
import { classGenerator } from "../../../utils/classGenerator";
import { ActionButton } from "./ActionButton";
import { CategoryList } from "./CategoryList";

export function CategorySection({ category }) {
    const sectionClass = classGenerator("vtex-menu-dropdown", "category-section");
    const titleClass = classGenerator("vtex-menu-dropdown", "category-title");

    return (
        <div className={sectionClass}>
            <div className={titleClass}>
                <a className={titleClass} style={{ textDecoration: "none" }} href={category.title_link}>{category.title}</a>
            </div>
            <CategoryList items={category.items} />
            <ActionButton
                text={category.actionButton.text}
                url={category.actionButton.url}
            />
        </div>
    );
}