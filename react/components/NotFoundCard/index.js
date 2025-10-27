import React from "react";
import { schema } from "./schema";
import { classGenerator } from "../../utils/classGenerator";

function NotFoundCard({
    VtexFlexLayout,
    checkList,
    titleRedCard
}) {
    return (
        <VtexFlexLayout>
            <div className={classGenerator("vtex-not-found-card", "container")}>
                <h2 className={classGenerator("vtex-not-found-card", "title")}>{titleRedCard}</h2>
                <ul className={classGenerator("vtex-not-found-card", "list")}>
                    {checkList.map((item, index) => (
                        <li className={classGenerator("vtex-not-found-card", "item")} key={index}>
                            <svg className={classGenerator("vtex-not-found-card", "item-icon")} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6.30556L4.46154 8.75L10 3.25" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span className={classGenerator("vtex-not-found-card", "item-text")}>{item.title}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </VtexFlexLayout>
    );
}

NotFoundCard.schema = schema;

export default NotFoundCard;