export function searchElementDom({
    elementSelector,
    elementContainer,
    maxCount = 100,
    callback,
}) {
    const container = elementContainer ?? (typeof document !== 'undefined' ? document : null);

    if (!container) return;

    function searching(count = 0) {
        const elementDom = container.querySelector(elementSelector);

        if (elementDom) {
            callback(elementDom);
        } else if (count < maxCount) {
            setTimeout(() => searching(count + 1), 50);
        }
    }

    searching();
}