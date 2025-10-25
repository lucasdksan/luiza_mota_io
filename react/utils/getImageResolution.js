export function getImageResolution(image_url = "", width = 0, height = 0) {
    const urlWithoutVersion = image_url.replace(/\?.+/, "");
    const urlBreak = urlWithoutVersion.match(/\/ids\/(\d+)\//i);
    const ids = urlBreak[1];
    const idsWithResolution = `${ids}-${width}-${height}`;

    return image_url.replace(ids, idsWithResolution);
}