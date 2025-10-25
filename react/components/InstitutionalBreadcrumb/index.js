import React from "react";
import { useRuntime } from "vtex.render-runtime";
import { classGenerator } from "../../utils/classGenerator";

function getNamesRegex(input) {
    const matches = input.match(/[^/]+/g);
    return matches || [];
}

function InstitutionalBreadcrumb({
    VtexFlexLayout,
}) {
    const { route: { path } } = useRuntime();
    const names = getNamesRegex(path);

    const ArrowRightIcon = () => (
        <div className={classGenerator("vtex-institutional-breadcrumb", "arrow-right-icon")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="#B8B8BC" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
    );

    return (
        <VtexFlexLayout>
            <div className={classGenerator("vtex-institutional-breadcrumb", "container")}>
                <a href="/" className={classGenerator("vtex-institutional-breadcrumb", "element-link")}>
                    <span className={classGenerator("vtex-institutional-breadcrumb", "element-text")}>Home</span>
                </a>
                <ArrowRightIcon />
                <a href="/institucional" className={
                    `${classGenerator("vtex-institutional-breadcrumb", "element-link")} ${names.length === 1 ? classGenerator("vtex-institutional-breadcrumb", "last-link") : ""}`
                }>
                    <span className={classGenerator("vtex-institutional-breadcrumb", "element-text")}>Institucional</span>
                </a>
                {names.map((name, index) => {
                    if (name === "institucional") {
                        return null;
                    }

                    return (
                        <React.Fragment key={index}>
                            <ArrowRightIcon />
                            <a href={`/institucional/${name}`} className={`${classGenerator("vtex-institutional-breadcrumb", "element-link")} ${index === names.length - 1 ? classGenerator("vtex-institutional-breadcrumb", "last-link") : ""}`}>
                                <span className={classGenerator("vtex-institutional-breadcrumb", "element-text")}>{name}</span>
                            </a>
                        </React.Fragment>
                    );
                })}
            </div>
        </VtexFlexLayout>
    );
}

export default InstitutionalBreadcrumb;