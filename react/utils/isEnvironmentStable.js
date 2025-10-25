export function isEnvironmentStable(){
    const { href } = window.location;
    return href.includes('myvtex') || href.includes('vtexcommercestable');
}