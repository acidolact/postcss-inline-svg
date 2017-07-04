export function encode(code) {
    return code
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23');
}

export function transform(code) {
    code = code
        .replace(/'/g, '%22')
        .replace(/"/g, '\'')
        .replace(/\s+/g, ' ')
        .replace(/:/, '%3A')
        .trim();
    return `"data:image/svg+xml;charset=utf-8,${code}"`;
}

