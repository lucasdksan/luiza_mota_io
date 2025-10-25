import React from "react";

import { useProduct } from "vtex.product-context";
import { priceProductSearch } from "./priceProductSearch";
import { classGenerator } from "../../utils/classGenerator";

function ProductSummaryDiscountFlag() {
	const { selectedItem } = useProduct();

	const getPrices = priceProductSearch(selectedItem);

	if (!getPrices.success || !getPrices.isAvailable) return null;

	const discountValue = Math.round(
		100 - (getPrices.sellerPrice * 100) / getPrices.listPrice
	);

	if (discountValue < 1) return null;

	return (
		<div className={classGenerator("vtex-product-summary-discount-flag", "container")}>
			<p className={classGenerator("vtex-product-summary-discount-flag", "value")}>
				-{discountValue}%
			</p>
		</div>
	);
};

export default ProductSummaryDiscountFlag;
