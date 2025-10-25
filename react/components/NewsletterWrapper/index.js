import React, { useEffect, useRef } from "react";
import { useRuntime } from "vtex.render-runtime";
import { initObservable } from "../../utils/initObservable";

function NewsletterWrapper({
    VtexNewsletter
}) {
    const wrapperRef = useRef(null);
    const {
        deviceInfo: { isMobile },
    } = useRuntime();

    useEffect(() => {
        if(!isMobile) return;

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const callback = () => {
            const header = wrapper.querySelector(
                ".vtex-flex-layout-0-x-flexCol--newsletter-header"
            );
            const successState = wrapper.querySelector(
                ".vtex-flex-layout-0-x-flexRow--success-state"
            );

            if (header && successState) {
                header.classList.add("vtex-newsletter-wrapper--close");
            } else if (header) {
                header.classList.remove("vtex-newsletter-wrapper--close");
            }
        };

        const observer = initObservable({
            domParent: wrapper,
            observationList: {
                childList: true,
                subtree: true,
            },
            callback,
            activeReturn: true,
        });

        callback();

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
            <VtexNewsletter />
        </div>
    );
}

export default NewsletterWrapper;