import React from "react";
import { useSearchPage } from "vtex.search-page-context/SearchPageContext";
import { classGenerator } from "../../utils/classGenerator";

function TotalProductsCustom({
    VtexFlexLayout
}){
    const { searchQuery } = useSearchPage();
    
    if(!searchQuery.products) return null;

    return(
        <VtexFlexLayout>
            <span className={classGenerator("vtex-total-products-custom", "text")}>Produtos encontrados: {searchQuery.recordsFiltered}</span>
        </VtexFlexLayout>
    );
}

export default TotalProductsCustom;