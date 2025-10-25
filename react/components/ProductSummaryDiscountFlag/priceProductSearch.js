export function priceProductSearch(selectedItem) {
	let success = false;
	let seller = [];
	let isSellerDefault = false;

	for (let index = 0; index < selectedItem.sellers.length; index++) {
		seller = selectedItem.sellers[index];
		isSellerDefault = seller.sellerDefault;

		if (isSellerDefault) {
			const { ListPrice, Price, spotPrice, AvailableQuantity } =
				seller.commertialOffer;

			return {
				success: true,
				isAvailable: AvailableQuantity > 0,
				sellerPrice: Number(Price),
				spotPrice: Number(spotPrice),
				listPrice: Number(ListPrice),
			};
		}
	}

	return { success };
};
