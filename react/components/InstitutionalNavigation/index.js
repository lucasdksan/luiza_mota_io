import React from "react";
import { useRuntime } from "vtex.render-runtime";
import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";

function InstitutionalNavigation({
    VtexFlexLayout,
    items,
}) {
    const { route: { path } } = useRuntime();

    if (!Array.isArray(items) || items.length === 0) return null;

    const ArrowRightIconWhite = () => (
        <div className={classGenerator("vtex-institutional-navigation", "arrow-right-icon-white")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    );

    const ArrowRightIconBlack = () => (
        <div className={classGenerator("vtex-institutional-navigation", "arrow-right-icon-black")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    );

    return (
        <VtexFlexLayout>
            <div className={classGenerator("vtex-institutional-navigation", "options-container")}>
                {items.map((item, index) => (
                    <a className={`${classGenerator("vtex-institutional-navigation", "element-link")} ${path === item.link ? classGenerator("vtex-institutional-navigation", "element-link-active") : ""}`} key={index} href={item.link}>
                        <span className={classGenerator("vtex-institutional-navigation", "element-text")}>{item.text}</span>
                        {path === item.link ? <ArrowRightIconWhite /> : <ArrowRightIconBlack />}
                    </a>
                ))}
            </div>
        </VtexFlexLayout>
    );
}

InstitutionalNavigation.schema = schema;

export default InstitutionalNavigation;