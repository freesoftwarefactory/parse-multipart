# parse-multipart

A javascript/nodejs multipart/form-data parser which operates on raw data.

# author

Cristian Salazar. Email: christiansalazarh@gmail.com, Website: www.chileshift.cl,
i live in Santiago de Chile. I am Amazon AWS developper focused in Serverless
software development, i call it: the new age of software development.

# Help & Tutorial

Please follow me on Twitter [@AmazonAwsVideos](https://twitter.com/amazonawsvideos) and keep informed about more Amazon Aws Videos. Watch my video on which i expose the necesary steps to [implement a Multiform/form-data parser inside a Amazon Aws ApiGateway](https://www.youtube.com/watch?v=BrYJlR0yRnw). You can [subscribe to my channel](https://www.youtube.com/c/ChristianSalazar).

# Background

Sometimes you only have access to the raw multipart payload and it needs to be
parsed in order to extract the files or data contained on it. As an example: 
the Amazon AWS ApiGateway, which will operate as a facade between the http
client and your component (the one written by you designed to extract the 
uploaded files or data). 

The raw payload formatted as multipart/form-data will looks like this one:

```
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

The lines above represents a raw multipart/form-data payload sent by some 
HTTP client via form submission containing two files. We need to extract the 
all files contained inside it. The multipart format allows you to send more 
than one file in the same payload, that's why it is called: multipart.

# Usage

In the next lines you can see a implementation. In this case two key values
needs to be present:

* body, which can be:

```
------WebKitFormBoundaryDtbT5UpPj83kllfw
Content-Disposition: form-data; name="uploads[]"; filename="sometext.txt"
Content-Type: application/octet-stream

hello how are you
------WebKitFormBoundaryDtbT5UpPj83kllfw--
```

* boundary, the string which serve as a 'separator' between parts, it normally
comes to you via headers. In this case, the boundary is:

```
	----WebKitFormBoundaryDtbT5UpPj83kllfw
```

Now, having this two key values then you can implement it:

```
	var multipart = require('parse-multipart');
	var body = "..the multipart raw body..";
	var boundary = "----WebKitFormBoundaryDtbT5UpPj83kllfw";
	var parts = multipart.Parse(body,boundary);
	
	for(let part of parts){
		var part = parts[i];
		// will be:
		// { name: 'userfile', filename: 'A.txt', type: 'text/plain', 
		//		data: <Buffer 41 41 41 41 42 42 42 42> }
		// In the event of multiple files with the same "name" attribute, a part will be an array of files. Such as during a multi file upload.
		// If no filename is supplied it will be ignored, if no name is supplied it will be null
	}
```

The returned data is an array of parts, each one described by a filename,
a type and a data, this last one is a Buffer (see also Node Buffer).


