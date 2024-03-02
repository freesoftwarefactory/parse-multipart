import { parseContentDisposition, parseContentType } from './parsers';

// Maintaining backwards compatibility.
export { parse as Parse };
export { parseBoundary as getBoundary } from './parsers';

export type Part = {
    /**
     * The parsed content type
     */
    type: string;

    /**
     * The name parsed from the content disposition
     */
    name?: string;

    /**
     * The filename parsed from the content disposition
     */
    filename?: string;

    /**
     * The parsed data as a Buffer
     */
    data: Buffer;
};

const enum State {
    /**
     * Before any boundaries have been parsed.
     */
    start = 0,

    /**
     * Ready to parse the Content-Disposition.
     */
    contentDisposition = 1,

    /**
     * Ready to parse the Content-Type.
     */
    contentType = 2,

    /**
     * Ready to start buffering data.
     */
    initializeBuffer = 3,

    /**
     * Accumulate data into the buffer.
     */
    bufferData = 4,
}

/**
 * Parse a multipart/form-data or multipart/mixed buffer using a known boundary.
 */
export function parse(buffer: Buffer, boundary: string): Part[] {
    const parts: Part[] = [];

    let state = State.start;
    let line = '';
    let part = {
        type: '',
        data: [] as number[],
    };

    for (let i = 0; i < buffer.length; i++) {
        const currentByte = buffer[i]!;
        const prevByte = buffer[i - 1];

        const isNewLineChar = currentByte == 0x0a || currentByte == 0x0d;
        if (!isNewLineChar) {
            line += String.fromCharCode(currentByte);
        }

        const newLineDetected = currentByte == 0x0a && prevByte == 0x0d;
        const isBoundary = line === `--${boundary}`;

        if (state < State.bufferData && newLineDetected) {
            if (state === State.contentDisposition) {
                Object.assign(part, parseContentDisposition(line));
            } else if (state === State.contentType) {
                Object.assign(part, { type: parseContentType(line) });
            }

            state += isBoundary || state > State.start ? 1 : 0;
        } else if (state === State.bufferData) {
            if (line.length > boundary.length + 4) {
                line = ''; // mem save
            }

            if (isBoundary) {
                parts.push({
                    ...part,
                    data: Buffer.from(part.data.slice(0, part.data.length - line.length - 1)),
                });

                // Reset
                part = { type: '', data: [] };
                state = State.start;
            } else {
                part.data.push(currentByte);
            }
        }

        if (newLineDetected) {
            line = '';
        }
    }

    return parts;
}
