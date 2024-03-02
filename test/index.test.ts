import { describe, test, expect } from 'vitest';
import { parse } from '../src/index';

// Simplify the output of Buffers in snapshots
expect.addSnapshotSerializer({
    test(input: unknown) {
        return Buffer.isBuffer(input);
    },
    serialize(buffer: Buffer) {
        return `<Buffer length=${buffer.byteLength}>`;
    },
});

describe('parse', () => {
    test('parses multipart body containing files', () => {
        const body = [
            'trash1',
            '------WebKitFormBoundaryvef1fLxmoUdYZWXp',
            'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"',
            'Content-Type: text/plain',
            '',
            '@11X',
            '111Y',
            '111Z\rCCCC\nCCCC',
            'CCCCC@',
            '',
            '------WebKitFormBoundaryvef1fLxmoUdYZWXp',
            'Content-Disposition: form-data; name="uploads[]"; filename="B.txt"',
            'Content-Type: text/plain',
            '',
            '@22X',
            '222Y',
            '222Z\r222W\n2220',
            '666@',
            '------WebKitFormBoundaryvef1fLxmoUdYZWXp--',
        ].join('\r\n');

        const parsed = parse(Buffer.from(body, 'utf8'), '----WebKitFormBoundaryvef1fLxmoUdYZWXp');

        expect(parsed).toMatchInlineSnapshot(`
          [
            {
              "data": <Buffer length=36>,
              "filename": "A.txt",
              "name": "uploads[]",
              "type": "text/plain",
            },
            {
              "data": <Buffer length=32>,
              "filename": "B.txt",
              "name": "uploads[]",
              "type": "text/plain",
            },
          ]
        `);
    });

    test('parses multipart body containing JSON', () => {
        const body = [
            '--607d1e4c402094785874403ce313bc31f09456a04b41910ce660854a4dcf',
            'Content-Disposition: form-data; name="json"',
            'Content-Type: application/json',
            '',
            '{',
            '    "distortions": [342],',
            '    "diffImages": ["image:diff1.png"]',
            '}',
            '--607d1e4c402094785874403ce313bc31f09456a04b41910ce660854a4dcf',
            'Content-Disposition: form-data; name="image:diff1.png"; filename="diff1.png"',
            'Content-Type: application/octet-stream',
            '',
            '@22X',
            '222Y',
            '222Z\r222W\n2220',
            '666@',
            '--607d1e4c402094785874403ce313bc31f09456a04b41910ce660854a4dcf--',
        ].join('\r\n');

        const parsed = parse(Buffer.from(body, 'utf8'), '607d1e4c402094785874403ce313bc31f09456a04b41910ce660854a4dcf');

        expect(parsed).toMatchInlineSnapshot(`
          [
            {
              "data": <Buffer length=70>,
              "name": "json",
              "type": "application/json",
            },
            {
              "data": <Buffer length=32>,
              "filename": "diff1.png",
              "name": "image:diff1.png",
              "type": "application/octet-stream",
            },
          ]
        `);

        expect(JSON.parse(parsed.at(0)?.data.toString('utf8')!)).toMatchInlineSnapshot(`
          {
            "diffImages": [
              "image:diff1.png",
            ],
            "distortions": [
              342,
            ],
          }
        `);
    });
});
