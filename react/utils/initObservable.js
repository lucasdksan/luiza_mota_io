export function initObservable({
	domParent,
	observationList = {
		childList: true,
		subtree: false,
		attributes: false,
		attributeFilter: [],
	},
	callback,
	activeReturn = false
}){
    const observer = new MutationObserver(() => callback(domParent));
	observer.observe(domParent, observationList);

	if(activeReturn) return observer;
}