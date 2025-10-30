import React, { useEffect, useState } from "react";

import { useProduct } from "vtex.product-context";

function ProductDefinitions({
    VtexFlexLayout
}) {
    const [productDefinitions, setProductDefinitions] = useState([]);
    const { product } = useProduct();
    const { description, specificationGroups  } = product;

    useEffect(() => {
        if(description) {
            setProductDefinitions((prev) => [...prev, {
                title: "Descrição",
                description: description
            }]);
        }

        if(specificationGroups) {
            
        }
    }, [description]);

    console.log("product: ", product);

    return (
        <VtexFlexLayout>
            
        </VtexFlexLayout>
    );
}

export default ProductDefinitions;