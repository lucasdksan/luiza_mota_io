import { initObservable } from "../../utils/initObservable";

export const getShippingData = ({ container, callback }) => {
    initObservable({
        domParent: container,
        observationList: { childList: true, subtree: true },
        callback: (domContainer) => {
            const shippingOptions = [];
            const pickUpFastOptions = [];
            const pickUpOptions = [];

            const table = domContainer.querySelector(
                '.vtex-store-components-3-x-shippingTableBody'
            );

            if (!!table) {
                [...table.childNodes].forEach((item) => {
                    const [label, estimate, price] = [...item.childNodes];
                    const option = {
                        ref: label.textContent,
                        label: label.textContent,
                        estimate: estimate.textContent.replace('Em até ', ''),
                        price: price.textContent,
                    };

                    if (label.textContent.toLowerCase().includes('retirada imediata')) {
                        pickUpFastOptions.push(option);
                    } else if (label.textContent.toLowerCase().includes('retirada')) {
                        pickUpOptions.push(option);
                    } else {
                        shippingOptions.push(option);
                    }
                });

                callback({
                    success: true,
                    shippingOptions,
                    pickUpFastOptions,
                    pickUpOptions,
                });
            }
        },
    });
}