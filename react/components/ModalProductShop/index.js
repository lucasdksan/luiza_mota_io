import { useState } from "react";
import { createPortal } from "react-dom";
import { useProduct } from "vtex.product-context";
import { classGenerator } from "../../utils/classGenerator";
import { pickMaxInstallmentsOption } from "../../utils/pickInstallments";
import { formatCurrency } from "../../utils/formatCurrency";

function ModalProductShop({
    VtexFlexLayoutBtn,
    VtexSkuSelector,
    VtexAddtoCart,
    VtexQuantity
}) {
    const [isOpen, setIsOpen] = useState(false);
    const productResponse = useProduct();
    const { selectedItem, product } = productResponse;
    const maxInstallmentsOption = pickMaxInstallmentsOption(selectedItem.sellers[0].commertialOffer.Installments)

    console.log("productResponse: ", productResponse);

    const toggleMenu = () => {
        setIsOpen((value) => !value);
    }

    return (
        <>
            <VtexFlexLayoutBtn>
                <button
                    className={classGenerator("vtex-modal-product-shop", "btn")}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMenu();
                    }}
                    aria-label="Abrir modal do produto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <path d="M17.0459 5.85889C17.7298 5.85944 18.3903 6.10886 18.9033 6.56104C19.3524 6.95697 19.662 7.48458 19.79 8.06494L19.834 8.31592V8.31689L20.5537 14.0962C20.5641 14.1798 20.5575 14.265 20.5352 14.3462C20.5127 14.4273 20.4745 14.5034 20.4229 14.5698C20.3711 14.6362 20.3066 14.6913 20.2334 14.7329C20.1602 14.7745 20.0797 14.8016 19.9961 14.812C19.9125 14.8224 19.8273 14.8168 19.7461 14.7944C19.7055 14.7832 19.6664 14.7674 19.6289 14.7485L19.5225 14.6821C19.456 14.6304 19.4 14.5659 19.3584 14.4927C19.3168 14.4194 19.2907 14.338 19.2803 14.2544L18.5596 8.47607L18.5361 8.33936C18.4668 8.02427 18.2994 7.73787 18.0557 7.52295C17.7769 7.27735 17.4174 7.14188 17.0459 7.14209H5.7041C5.3326 7.14188 4.97307 7.27735 4.69434 7.52295C4.41578 7.76853 4.236 8.10764 4.18945 8.47607L2.56445 21.4751C2.53775 21.6898 2.55729 21.9081 2.62109 22.1147C2.68493 22.3215 2.79243 22.5121 2.93555 22.6743C3.07863 22.8365 3.2541 22.967 3.45117 23.0562C3.64833 23.1453 3.86273 23.1916 4.0791 23.1919H18.6709C18.7474 23.1797 18.8254 23.1799 18.9014 23.1958C18.9833 23.213 19.0608 23.2471 19.1299 23.2944C19.1989 23.3418 19.2581 23.402 19.3037 23.4722C19.3494 23.5424 19.3813 23.6213 19.3965 23.7036C19.4269 23.8712 19.3904 24.0441 19.2949 24.1851C19.1992 24.3262 19.051 24.4249 18.8838 24.4585H18.8809C18.8115 24.4703 18.7412 24.4749 18.6709 24.4741V24.4751H4.0791C3.68059 24.4753 3.28613 24.3909 2.92285 24.2271C2.55958 24.0632 2.23535 23.8237 1.97168 23.5249C1.70802 23.2261 1.51088 22.8745 1.39355 22.4937C1.27624 22.1128 1.24123 21.7113 1.29102 21.3159L2.91602 8.31592L2.95996 8.06396C3.08811 7.48388 3.39776 6.95677 3.84668 6.56104C4.35959 6.10901 5.01946 5.85954 5.70312 5.85889H17.0459Z" fill="white" stroke="white" stroke-width="0.2" />
                        <path d="M11.375 1.52539C12.5506 1.52539 13.6784 1.99203 14.5098 2.82324C15.3411 3.65458 15.8085 4.78233 15.8086 5.95801V10.292C15.8085 10.4619 15.7411 10.6249 15.6211 10.7451C15.5008 10.8655 15.3372 10.9336 15.167 10.9336C14.9968 10.9336 14.8332 10.8655 14.7129 10.7451C14.5928 10.6249 14.5255 10.4619 14.5254 10.292V5.95801C14.5253 5.12269 14.1932 4.32113 13.6025 3.73047C13.0118 3.13993 12.2103 2.80859 11.375 2.80859C10.5397 2.80868 9.73812 3.13981 9.14746 3.73047C8.5568 4.32113 8.22567 5.12269 8.22559 5.95801V10.292C8.2255 10.4621 8.15737 10.6249 8.03711 10.7451C7.91685 10.8654 7.75405 10.9335 7.58398 10.9336C7.4138 10.9336 7.25022 10.8655 7.12988 10.7451C7.00973 10.6249 6.94247 10.462 6.94238 10.292V5.95801C6.94247 4.78233 7.4089 3.65458 8.24023 2.82324C9.07157 1.99191 10.1993 1.52548 11.375 1.52539Z" fill="white" stroke="white" stroke-width="0.2" />
                        <path d="M17.8828 13.5474C18.9527 13.3346 20.0615 13.4444 21.0693 13.8618C22.0774 14.2794 22.9397 14.9859 23.5459 15.8931C24.1521 16.8003 24.4756 17.8674 24.4756 18.9585C24.4739 20.421 23.8916 21.8228 22.8574 22.8569C21.8233 23.8911 20.4215 24.4734 18.959 24.4751C17.8679 24.4751 16.8008 24.1516 15.8936 23.5454C14.9863 22.9392 14.2798 22.0769 13.8623 21.0688C13.4449 20.061 13.3351 18.9522 13.5479 17.8823C13.7607 16.8122 14.2861 15.8286 15.0576 15.0571C15.8291 14.2856 16.8127 13.7602 17.8828 13.5474ZM18.959 14.7251C18.1217 14.7251 17.3026 14.9728 16.6064 15.438C15.9103 15.9032 15.3683 16.5649 15.0479 17.3384C14.7275 18.1118 14.6434 18.9627 14.8066 19.7837C14.97 20.6048 15.3729 21.3596 15.9648 21.9517C16.5569 22.5437 17.3116 22.9465 18.1328 23.1099C18.954 23.2732 19.8056 23.19 20.5791 22.8696C21.3525 22.5492 22.0134 22.0062 22.4785 21.3101C22.9436 20.614 23.1923 19.7957 23.1924 18.9585C23.1911 17.8361 22.7438 16.76 21.9502 15.9663C21.1567 15.1729 20.0811 14.7265 18.959 14.7251Z" fill="white" stroke="white" stroke-width="0.2" />
                        <path d="M18.959 16.6919C19.129 16.692 19.2919 16.7592 19.4121 16.8794C19.5324 16.9997 19.6006 17.1633 19.6006 17.3335V20.5835C19.6005 20.7536 19.5324 20.9164 19.4121 21.0366C19.2919 21.1569 19.129 21.225 18.959 21.2251C18.7888 21.2251 18.6252 21.157 18.5049 21.0366C18.3847 20.9164 18.3175 20.7535 18.3174 20.5835V17.3335C18.3174 17.1633 18.3845 16.9997 18.5049 16.8794C18.6252 16.7591 18.7888 16.6919 18.959 16.6919Z" fill="white" stroke="white" stroke-width="0.2" />
                        <path d="M20.584 18.3169C20.754 18.317 20.9169 18.3842 21.0371 18.5044C21.1574 18.6247 21.2256 18.7883 21.2256 18.9585C21.2255 19.1286 21.1574 19.2914 21.0371 19.4116C20.9168 19.5319 20.754 19.6 20.584 19.6001H17.334C17.1638 19.6001 17.0002 19.532 16.8799 19.4116C16.7597 19.2914 16.6925 19.1285 16.6924 18.9585C16.6924 18.7883 16.7595 18.6247 16.8799 18.5044C17.0002 18.3841 17.1638 18.3169 17.334 18.3169H20.584Z" fill="white" stroke="white" stroke-width="0.2" />
                    </svg>
                </button>
            </VtexFlexLayoutBtn>

            {isOpen && (
                createPortal(<>
                    <div
                        className={classGenerator("vtex-modal-product-shop", "overlay")}
                        onClick={toggleMenu}
                    />
                    <div className={classGenerator("vtex-modal-product-shop", "modal")}>
                        <button
                            className={classGenerator("vtex-modal-product-shop", "close-btn")}
                            onClick={toggleMenu}
                            aria-label="Fechar modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M16 10L10 16" stroke="#858588" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M10 10L16 16" stroke="#858588" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M13 23C18.5228 23 23 18.5228 23 13C23 7.47715 18.5228 3 13 3C7.47715 3 3 7.47715 3 13C3 18.5228 7.47715 23 13 23Z" stroke="#858588" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <div className={classGenerator("vtex-modal-product-shop", "wrapper")}>
                            <div className={classGenerator("vtex-modal-product-shop", "image-container")}>
                                <img className={classGenerator("vtex-modal-product-shop", "image")} src={selectedItem.images[0].imageUrl} width={370} height={300} alt={selectedItem.name} />
                            </div>
                            <div className={classGenerator("vtex-modal-product-shop", "product-info")}>
                                <div className={classGenerator("vtex-modal-product-shop", "first-line")}>
                                    <div className={classGenerator("vtex-modal-product-shop", "product-data")}>
                                        <span className={classGenerator("vtex-modal-product-shop", "product-name")}>{selectedItem.name}</span>
                                    </div>
                                    <div className={classGenerator("vtex-modal-product-shop", "product-price-area")}>
                                        <span className={classGenerator("vtex-modal-product-shop", "product-price")}>{formatCurrency(selectedItem.sellers[0].commertialOffer.Price)}</span>
                                        <span className={classGenerator("vtex-modal-product-shop", "product-installments")}>{ maxInstallmentsOption ? `Ou ${maxInstallmentsOption.NumberOfInstallments}x de ${formatCurrency(maxInstallmentsOption.Value)} sem juros` : `Ou de 1x de ${formatCurrency(selectedItem.sellers[0].commertialOffer.Price)}`}</span>
                                    </div>
                                    <a href={product.link} className={classGenerator("vtex-modal-product-shop", "redirect")}>Saiba  mais</a>
                                </div>
                                <div className={classGenerator("vtex-modal-product-shop", "last-line")}>
                                    <VtexSkuSelector />
                                    <div className={classGenerator("vtex-modal-product-shop", "product-shop-action")}>
                                        <VtexQuantity />
                                        <VtexAddtoCart />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                    document.body)
            )}
        </>
    );
}

export default ModalProductShop;