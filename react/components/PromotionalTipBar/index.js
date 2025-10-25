import React, { useState } from "react";
import { schema } from "./schema";
import { classGenerator } from "../../utils/classGenerator";
import CloseIcon from "./components/CloseIcon";

function PromotionalTipBar({
    VtexFlexLayout,
    VtexSliderLayout,
    texts
}) {
    const [activeBar, setActiveBar] = useState(true);

    if (!Array.isArray(texts) || texts.length === 0) {
        return null;
    }

    const handleChangeState = () => {
        setActiveBar((value) => !value);
    }

    if(!activeBar) return null;

    return (
        <VtexFlexLayout>
            {texts.length === 1 ? (
                <div className={classGenerator("vtex-promotional-tip-bar", "content-value")}>
                    <div dangerouslySetInnerHTML={{ __html: texts[0] }} className={classGenerator("vtex-promotional-tip-bar", "value")} />
                </div>
            ) : (
                <VtexSliderLayout>
                    {texts.map((text, index) => (
                        <div key={index} className={classGenerator("vtex-promotional-tip-bar", "content-value")}>
                            <div dangerouslySetInnerHTML={{ __html: text }} className={classGenerator("vtex-promotional-tip-bar", "value")} />
                        </div>
                    ))}
                </VtexSliderLayout>
            )}
            <button className={classGenerator("vtex-promotional-tip-bar", "close-btn")} onClick={handleChangeState}>
                <CloseIcon />
            </button>
        </VtexFlexLayout>
    );
}

PromotionalTipBar.schema = schema;

export default PromotionalTipBar;