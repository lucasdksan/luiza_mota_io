import React from "react";
import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";
import SlickContainer from "./components/SlickContainer";

function MiddleBanners({
    VtexFlexLayout,
    banners
}) {
    if (!Array.isArray(banners) || banners.length === 0) return null;

    return (
        <VtexFlexLayout>
            <SlickContainer isMobile>
                {banners.map((banner, index) => (
                    <div className={classGenerator("vtex-middle-banners", "element")} key={index}>
                        <a className={classGenerator("vtex-middle-banners", "link")} href={banner.link}>
                            <img
                                src={banner.image}
                                className={classGenerator("vtex-middle-banners", "banner")}
                                alt={banner.alt}
                                width={350}
                                height={320}
                            />
                        </a>
                    </div>
                ))}
            </SlickContainer>
        </VtexFlexLayout>
    );
}

export default MiddleBanners;