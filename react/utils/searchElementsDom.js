export function searchElementsDom({
	elementSelector,
	elementContainer = document,
	maxCount = 100,
	callback,
}) {
    const container = elementContainer ?? (typeof document !== 'undefined' ? document : null);

    if (!container) return;
    
	function searching(count = 0) {
		const elementDom = elementContainer.querySelectorAll(elementSelector);

		if (elementDom.length > 0) {
			callback(elementDom);
		} else if (count < maxCount) {
			setTimeout(() => {
				searching(count + 1);
			}, 50);
		}
	};

	searching();
};