import React from "react";
import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";

function ServiceHighlights({
    VtexFlexLayout,
    highlights
}) {
    if (!highlights || !Array.isArray(highlights) || highlights.length === 0) return null;

    return (
        <VtexFlexLayout>
            {highlights.map((highlight, index) => (
                <div
                    className={classGenerator("vtex-service-highlight", "element")}
                    key={index}
                >
                    <img
                        className={classGenerator("vtex-service-highlight", "element-icon")}
                        width={40}
                        height={40}
                        src={highlight.icon}
                        alt={`Icon do serviço - ${highlight.name}`}
                    />
                    <span className={classGenerator("vtex-service-highlight", "element-title")}>{highlight.name}</span>
                </div>
            ))}
        </VtexFlexLayout>
    );
}

ServiceHighlights.schema = schema;

export default ServiceHighlights;