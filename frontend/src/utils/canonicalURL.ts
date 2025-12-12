function canonicalURL(url: string): string {
    let raw = new URL(url);

    return `https://${raw.hostname}${raw.pathname}`;
}

export { canonicalURL };

