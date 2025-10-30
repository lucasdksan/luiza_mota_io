import React from "react";

import { useProduct } from "vtex.product-context";

function ProductDefinitions({
    VtexFlexLayout
}) {
    const product = useProduct();

    console.log("product: ", product);

    return (
        <VtexFlexLayout>
            
        </VtexFlexLayout>
    );
}

export default ProductDefinitions;