import { classGenerator } from "../../utils/classGenerator";
import { schema } from "./schema";

function ShareSocialMedia({
    VtexFlexLayout,
    socialMediaList
}) {
    return (
        <VtexFlexLayout>
            <div className={classGenerator("vtex-share-social-media", "title")}>
                <span className={classGenerator("vtex-share-social-media", "title-text")}>Compartilhar</span>
            </div>
            <div className={classGenerator("vtex-share-social-media", "social-media-list")}>
                {socialMediaList.map((socialMedia, index) => (
                    <a href={socialMedia.link} key={index} className={classGenerator("vtex-share-social-media", "social-media-item")}>
                        <img src={socialMedia.icon} alt={socialMedia.name} className={classGenerator("vtex-share-social-media", "social-media-item-icon")} />
                    </a>
                ))}
            </div>
        </VtexFlexLayout>
    );
}

ShareSocialMedia.schema = schema;

export default ShareSocialMedia;