function canonicalURL(url: string): string {
    let raw = new URL(url);

    if (raw.hostname.endsWith('devfolio.co')) return `https://${raw.hostname}/`;

    return `https://${raw.hostname}${raw.pathname}`;
}

export { canonicalURL };
