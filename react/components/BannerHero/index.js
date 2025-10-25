import { useRuntime } from "vtex.render-runtime";
import { schema } from "./schema";
import { classGenerator } from "../../utils/classGenerator";

function BannerHero({
    VtexSliderLayout,
    VtexFlexLayout,
    banners
}) {
    const {
        deviceInfo: { isMobile },
    } = useRuntime();

    if (!banners || banners.length === 0) return null;

    if (banners.length === 1) {
        return (
            <VtexFlexLayout>
                {banners[0].activeVideo ? (
                    <a className={classGenerator("vtex-banner-hero", "banner-link")} href={banners[0].link}>
                        <video
                            className={classGenerator("vtex-banner-hero", "banner-video")}
                            src={isMobile ? banners[0].videoMobile : banners[0].videoDesktop}
                            autoPlay
                            muted
                            loop
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                        ></video>
                    </a>
                ) : (
                    <a className={classGenerator("vtex-banner-hero", "banner-link")} href={banners[0].link}>
                        <img className={classGenerator("vtex-banner-hero", "banner-image")} src={isMobile ? banners[0].imageMobile : banners[0].imageDesktop} alt={banners[0].alt} />
                    </a>
                )}
            </VtexFlexLayout>
        )
    }

    return (
        <VtexSliderLayout infinite={banners.length > 1}>
            {banners.map((banner, index) => banner.activeVideo ? (
                <a className={classGenerator("vtex-banner-hero", "banner-link")} href={banner.link} key={index}>
                    <video
                        className={classGenerator("vtex-banner-hero", "banner-video")}
                        src={isMobile ? banner.videoMobile : banner.videoDesktop}
                        autoPlay
                        muted
                        loop
                        playsInline
                        webkit-playsinline="true"
                        preload="metadata"
                    ></video>
                </a>
            ) : (
                <a className={classGenerator("vtex-banner-hero", "banner-link")} href={banner.link} key={index}>
                    <img className={classGenerator("vtex-banner-hero", "banner-image")} key={index} src={isMobile ? banner.imageMobile : banner.imageDesktop} alt={banner.alt} />
                </a>
            ))}
        </VtexSliderLayout>
    )
}

BannerHero.schema = schema;

export default BannerHero;