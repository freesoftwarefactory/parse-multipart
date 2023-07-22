# parse-multipart

A javascript/nodejs multipart/form-data parser which operates on raw data.

# note

this code is not abandoned. i just keep it as its minimum as possible.

# author

My name is Cristian Salazar (christiansalazarh@gmail.com) from Santiago Chile (South America). 

I'm an Amazon AWS developper focused in Serverless software development, i call it: the new age of software development.

im open to remote job:

please visit my profile on: [https://www.linkedin.com/in/cristian-salazar-h](www.linkedin.com/in/cristian-salazar-h)

# Video/Tutorial

You can Watch my video on which i expose the necesary steps to [implement a Multiform/form-data parser inside a Amazon Aws ApiGateway](https://www.youtube.com/watch?v=BrYJlR0yRnw).

# Background

Sometimes you have a server listeing for data arriving to it (example: the Amazon API Gateway in AWS), this is called a "endpoint". Some website or script may send data to this endpoint. It may contain files or text, a encoded video and so on. The data is packaged in a well know format called "multipart/form-data". This data must be parsed, you must know where the data is, how many data comes to you and other aspects. This component will help you on this. 

As an example, The Amazon AWS ApiGateway. It operates as a facade between the http/s client (as an exampe, the browser) and your component (your lambda function, an action script etc). The "component" is the one written by you designed to extract the uploaded files or the data contained on it and then perform operations with it (storage etc). 

# What means "Multipart/form-data".

The 'mutipart/form-data' is the raw data attached to a POST coming inside a Http request, it has a format and marks to let you now when it starts and when it ends, this marks are also used to separate each "part of the data" that means: the same POST may have different parts: text and/or files or video,sound etc. 

First, i need to clarify this point: some people think that "multipart" means: "a POST comming several times to an endpoint" each part having a "new or the next part" of the whole data", this is wrong approach and may confuse you when trying to undestand this work. Please have it in mind. The data arrives as a whole package in the same POST, that is: if you send a file, the entire file is contained in the POST, it will have a initial mark and a finalization mark, the mark is also sent to you in the same post. In other words, The "multipart" means: in the same post you will find many parts of different data separated by a mark. It may be different files, or text, etc.

The header in the multipart/form-data has fields, this let you know about what is coming to you, the next paragraph will explain this:

# Data Fields

It is important to mention that sometimes the raw data contains some fields (look at the example below this lines, "filename=.." etc). So you must deal with it and parse the "field=value;" token. Some persons wrote a very nice modifications to my code in order to handle this fields in a better approach than mine, you may find the solution here: https://github.com/freesoftwarefactory/parse-multipart/pull/7.

# Raw data example received in an endpoint:

The raw payload is formatted as a "multipart/form-data" will look like this one:

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

The lines above represents a raw multipart/form-data payload sent by some HTTP client via form submission containing two files. We need to extract the all files contained inside it. The multipart format allows you to send more than one file in the same payload, that's why it is called: multipart.

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
	
	for(var i=0;i<parts.length;i++){
		var part = parts[i];
		// will be:
		// { filename: 'A.txt', type: 'text/plain', 
		//		data: <Buffer 41 41 41 41 42 42 42 42> }
	}
```

The returned data is an array of parts, each one described by a filename, a type and a data, this last one is a Buffer (see also Node Buffer).
