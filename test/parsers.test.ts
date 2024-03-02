import { describe, test, expect } from 'vitest';
import { parseBoundary, parseContentDisposition, parseContentType } from '../src/parsers';

describe('parseBoundary', () => {
    const suite = test.each`
        input                                                                                                     | output
        ${'Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B'}                   | ${'----WebKitFormBoundaryvm5A9tzU1ONaGP5B'}
        ${'Content-Type: multipart/mixed; boundary=cf3378c5b978a6cf0c121243a2e9974fc95918ef6ac295b34872965de124'} | ${'cf3378c5b978a6cf0c121243a2e9974fc95918ef6ac295b34872965de124'}
    `;

    suite('$input -> $output', ({ input, output }) => {
        expect(parseBoundary(input)).toBe(output);
    });
});

describe('parseContentDisposition', () => {
    const suite = test.each`
        input                                                                               | output
        ${'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"'}             | ${{ name: 'uploads[]', filename: 'A.txt' }}
        ${'Content-Disposition: form-data; name="image:actual.png"; filename="actual.png"'} | ${{ name: 'image:actual.png', filename: 'actual.png' }}
        ${'Content-Disposition: form-data; name="json"'}                                    | ${{ name: 'json' }}
    `;

    suite('$input -> $output', ({ input, output }) => {
        expect(parseContentDisposition(input)).toEqual(output);
    });
});

describe('parseContentType', () => {
    const suite = test.each`
        input                                       | output
        ${'Content-Type: text/plain'}               | ${'text/plain'}
        ${'Content-Type: application/json'}         | ${'application/json'}
        ${'Content-Type: application/octet-stream'} | ${'application/octet-stream'}
    `;

    suite('$input -> $output', ({ input, output }) => {
        expect(parseContentType(input)).toEqual(output);
    });
});
