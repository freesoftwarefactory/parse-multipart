/**
 * Parse the boundary from a "content-type" header.
 *
 * @example
 * 'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B'
 */
export function parseBoundary(input: string): string | undefined {
    return input
        .split(';')
        .find((item) => item.includes('boundary'))
        ?.trim()
        ?.split('=')
        .at(1);
}

/**
 * Parse "Content-Disposition" fields.
 *
 * @example
 * 'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"'
 */
export function parseContentDisposition(input: string): { name?: string; filename?: string } {
    const result: { name?: string; filename?: string } = {};

    for (const field of input.split(';').slice(1)) {
        const [key, value] = field.trim().split('=');
        if ((key === 'name' || key === 'filename') && value !== undefined) {
            result[key] = JSON.parse(value);
        }
    }

    return result;
}

/**
 * Parse "Content-Type".
 *
 * @example
 * 'Content-Type: text/plain'
 */
export function parseContentType(input: string): string | undefined {
    return input.split(':').at(1)?.trim();
}
