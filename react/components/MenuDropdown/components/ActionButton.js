import React from "react";
import { classGenerator } from "../../../utils/classGenerator";

export function ActionButton({ text, url }) {
    const buttonClass = classGenerator("vtex-menu-dropdown", "action-button")

    if (text === "") return <></>;

    return (
        <a href={url} className={buttonClass}>
            {text}
        </a>
    )
}