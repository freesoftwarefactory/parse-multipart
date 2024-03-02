# `parse-multipart`

A JavaScript/node multipart/form-data parser that operates on raw data.

## Author

My name is Cristian Salazar (christiansalazarh@gmail.com) from Santiago Chile (South America).

I'm an Amazon AWS developer focused on Serverless software development, I call it: the new age of software development.

_I'm open to remote jobs:_

please visit my profile at: [https://www.linkedin.com/in/cristian-salazar-h](https://www.linkedin.com/in/cristian-salazar-h)

## Video/Tutorial

You can Watch my video where I expose the necessary steps to [implement a Multiform/form-data parser inside a Amazon Aws ApiGateway](https://www.youtube.com/watch?v=BrYJlR0yRnw).

## Background

Sometimes you have a server listening for data arriving at it (e.g., the Amazon API Gateway in AWS), this is called an "endpoint". Some website or script may send data to this endpoint. It may contain files or text, an encoded video and so on. The data is packaged in a well-known format called "multipart/form-data". This data must be parsed, you must know where the data is, how much data comes to you and other aspects. This component will help you with this.

As an example, The Amazon AWS ApiGateway. It operates as a facade between the http/s client (as an example, the browser) and your component (your lambda function, an action script etc). The "component" is the one written by you designed to extract the uploaded files or the data contained on it and then perform operations with it (storage etc).

## What is "Multipart/form-data"?

`mutipart/form-data` is the raw data attached to a POST coming with an HTTP request, it has a format and marks to let you know when it starts and when it ends, these marks are also used to separate each "part of the data" that means: the same POST may have different parts: text and/or files or video, sound etc.

First, I need to clarify this point: some people think that "multipart" means: "a POST coming several times to an endpoint" each part having a "new or the next part" of the whole data", this is the wrong approach and may confuse you when trying to understand this work. Please have it in mind. The data arrives as a whole package in the same POST, that is: if you send a file, the entire file is contained in the POST, it will have an initial mark and a finalization mark, the mark is also sent to you in the same post. In other words, The "multipart" means: in the same post you will find many parts of different data separated by a mark. It may be different files, text, etc.

The header in the multipart/form-data has fields, that lets you know about what is coming to you, the next paragraph will explain this:

## Data Fields

It is important to mention that sometimes the raw data contains some fields (look at the example below these lines, "filename=.." etc). So you must deal with it and parse the "field=value;" token. Some person wrote a very nice modification to my code to handle these fields in a better approach than mine, you may find the solution here: https://github.com/freesoftwarefactory/parse-multipart/pull/7.

## Raw data example received in an endpoint

The raw payload is formatted as a "multipart/form-data" will look like this one:

```text
------WebKitFormBoundaryDtbT5UpPj83kllfw
Content-Disposition: form-data; name="uploads[]"; filename="somebinary.dat"
Content-Type: application/octet-stream

some binary data...maybe the bits of a image..
------WebKitFormBoundaryDtbT5UpPj83kllfw
Content-Disposition: form-data; name="uploads[]"; filename="sometext.txt"
Content-Type: text/plain

hello how are you
------WebKitFormBoundaryDtbT5UpPj83kllfw--
```

The lines above represent a raw multipart/form-data payload sent by some HTTP client via form submission containing two files. We need to extract the all files contained inside it. The multipart format allows you to send more than one file in the same payload, that's why it is called: multipart.

## Usage

In the next lines, you can see an implementation. In this case, two key values
need to be present:

-   body, which can be:

```text
------WebKitFormBoundaryDtbT5UpPj83kllfw
Content-Disposition: form-data; name="uploads[]"; filename="sometext.txt"
Content-Type: application/octet-stream

hello how are you
------WebKitFormBoundaryDtbT5UpPj83kllfw--
```

-   boundary, the string which serves as a 'separator' between parts, it normally
    comes to you via headers. In this case, the boundary is:

```text
----WebKitFormBoundaryDtbT5UpPj83kllfw
```

Now, having these two key values then you can implement it:

```js
import { parse } from 'parse-multipart';

const body = '..the multipart raw body..';
const boundary = '----WebKitFormBoundaryDtbT5UpPj83kllfw';
const parts = parse(body, boundary);

for (const { data, filename, name, type } of parts) {
    // Handle part
}
```

The returned data is an array of parts, each one described by a filename, a type and a data, this last one is a Buffer (see also Node Buffer).
