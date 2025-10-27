import React, { useEffect, useState } from "react";
import { useItemContext } from "vtex.product-list/ItemContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { classGenerator } from "../../utils/classGenerator";
import { pickMaxInstallmentsOption } from "../../utils/pickInstallments";

function InstallmentsCustom({
    VtexFlexLayout
}) {
    const [maxInstallmentsOption, setMaxInstallmentsOption] = useState(null);
    const { item } = useItemContext();
    const { productId, id } = item;

    const handleGetProductData = async () => {
        const response = await fetch("/api/catalog_system/pub/products/search?fq=productId:".concat(productId));
        const data = await response.json();

        if(!Array.isArray(data) || data.length === 0) {
            setMaxInstallmentsOption(null);
            return;
        }

        const { items } = data[0];

        const itemsFiltered = items.filter(item => item.itemId === id);
        
        if(Array.isArray(itemsFiltered) && itemsFiltered.length > 0) {
            const maxInstallmentsOption = pickMaxInstallmentsOption(itemsFiltered[0].sellers[0].commertialOffer.Installments);
            setMaxInstallmentsOption(maxInstallmentsOption);
        } else {
            setMaxInstallmentsOption(null);
        }
    }

    useEffect(() => {
        handleGetProductData();
    }, []);

    if(!maxInstallmentsOption) return null;

    return (
        <VtexFlexLayout>
            <p className={classGenerator("vtex-installments-custom", "text")}>
                ou <strong className={classGenerator("vtex-installments-custom", "text-strong")}>{maxInstallmentsOption.NumberOfInstallments}x</strong> de <strong className={classGenerator("vtex-installments-custom", "text-strong")}>{formatCurrency(maxInstallmentsOption.TotalValuePlusInterestRate)}</strong>
            </p>
        </VtexFlexLayout>
    );
}

export default InstallmentsCustom;