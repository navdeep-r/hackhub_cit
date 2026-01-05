function canonicalURL(url: string): string {
    let raw = new URL(url);

    if (raw.hostname.endsWith('devfolio.co')) return `https://${raw.hostname}/`;

    if (raw.hostname == 'dorahacks.io') {
        const match = raw.pathname.match(/^\/hackathon\/([^/]+)/);

        if (match) return `https://dorahacks.io/hackathon/${match[1]}/`;
    }

    if (raw.hostname == 'vision.hack2skill.com') {
        const match = raw.pathname.match(/^\/event\/([^/]+)/);

        if (match) return `https://vision.hack2skill.com/event/${match[1]}`;
    }


    return `https://${raw.hostname}${raw.pathname}`;
}

export { canonicalURL };
