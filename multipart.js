/**
 	Multipart Parser (Finite State Machine)

	usage:

	var multipart = require('./multipart.js');
	var body = multipart.DemoData(); 							   // raw body
	var body = new Buffer(event['body-json'].toString(),'base64'); // AWS case
	
	var boundary = multipart.getBoundary(event.params.header['content-type']);
	var parts = multipart.Parse(body,boundary);
	
	// each part is:
	// [ 'userfile': { filename: 'A.txt', name:'userfile', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> } ]

	author:  Cristian Salazar (christiansalazarh@gmail.com) www.chileshift.cl
			 Twitter: @AmazonAwsChile
 */
exports.Parse = function(multipartBodyBuffer,boundary){
	var process = function(part){
		// will transform this object:
		// { headers: [
		//		'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"',
		//		'Content-Type: text/plain'
		//	 ]
		//	 part: 'AAAABBBB' }
		// into this one: ( Assumed the return value? )
		// { filename: 'A.txt', name: 'userfile', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }
		let file = {
			data: new Buffer(part.part),
			name: null,
		};
		
		//Content-Disposition: form-data; name="uploads[]"; filename="A.txt"
		// Process our headers
		for (let header of part.headers) {
			if (header == '') continue;
			let ex = header.split(":");
			
			switch (ex[0].toLowerCase()) {
				case 'content-type':
					file.type = ex[1].trim();
					break;
				case 'content-id':
					file.id = ex[1].trim();
					break;
				case 'content-disposition':
					ex.splice(0,1); // Remove the header field name.
					for (let param of ex[0].split(" ")) {
						// Trim the ; if its there.
						if (param.substr(-1) == ";") {
							param = param.substr(0,param.length-1);
						}
						let pex = param.split("=");
						if (pex[0].toLowerCase() == "name") {
							pex.splice(0,1);
							file.name = pex.join("=").trim().replace(/"/g,'');
						} else if (pex[0].toLowerCase() == "filename") {
							pex.splice(0,1);
							file.filename = pex.join("=").trim().replace(/"/g,'');
						}
					}
					break;
			}
		}
		
		return file;
	}
	
	var prev = null;
	var lastline='';
	var headers = [];
	var state=0; var buffer=[];
	var allParts = [];

	for(i=0;i<multipartBodyBuffer.length;i++){
		var oneByte = multipartBodyBuffer[i];
		var prevByte = i > 0 ? multipartBodyBuffer[i-1] : null;
		var newLineDetected = ((oneByte == 0x0a) && (prevByte == 0x0d)) ? true : false;
		var newLineChar = ((oneByte == 0x0a) || (oneByte == 0x0d)) ? true : false;

		if(!newLineChar)
			lastline += String.fromCharCode(oneByte);

		if((0 == state) && newLineDetected){
			if(("--"+boundary) == lastline){
				state=1;
			}
			lastline='';
		}else
		if((1 == state) && newLineDetected){
			headers.push(lastline.trim());
			state=2;
			lastline='';
		}else
		if((2 == state) && newLineDetected){
			headers.push(lastline.trim());
			state=3;
			lastline='';
		}else
		if((3 == state) && newLineDetected){
			state=4;
			buffer=[];
			lastline='';
		}else
		if(4 == state){
			if(lastline.length > (boundary.length+4)) lastline=''; // mem save
			if(((("--"+boundary) == lastline))){
				var j = buffer.length - lastline.length;
				var part = buffer.slice(0,j-1);
				var p = { headers: headers, part: part  };
				allParts.push(process(p));
				buffer = []; lastline=''; state=5; header=''; info='';
			}else{
				buffer.push(oneByte);
			}
			if(newLineDetected) lastline='';
		}else
		if(5==state){
			if(newLineDetected)
				state=1;
		}
	}
	
	let parts = {};
	for (let part of allParts) {
		if (!parts[part.name]) {
			parts[part.name] = part;
		} else {
			parts[part.name] = [ parts[part.name] ];
			parts[part.name].push(part);
		}
	}
	
	return parts;
};

//  read the boundary from the content-type header sent by the http client
//  this value may be similar to:
//  'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B',
exports.getBoundary = function(header){
	// Just incase someone just wants to throw the headers our way.
	if (header['content-type']) header = header['content-type'];
	var items = header.split(';');
	if(items)
		for(i=0;i<items.length;i++){
			var item = (new String(items[i])).trim();
			if(item.indexOf('boundary') >= 0){
				var k = item.split('=');
				return (new String(k[1])).trim();
			}
		}
	return "";
}

exports.DemoData = function(){
	body = "trash1\r\n"
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
	body += "Content-Disposition: form-data; name=\"uploads[]\"; filename=\"A.txt\"\r\n";
	body += "Content-Type: text/plain\r\n",
	body += "\r\n\r\n";
	body += "@11X";
	body += "111Y\r\n";
	body += "111Z\rCCCC\nCCCC\r\nCCCCC@\r\n\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
	body += "Content-Disposition: form-data; name=\"uploads[]\"; filename=\"B.txt\"\r\n";
	body += "Content-Type: text/plain\r\n",
	body += "\r\n\r\n";
	body += "@22X";
	body += "222Y\r\n";
	body += "222Z\r222W\n2220\r\n666@\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n";
	return (new Buffer(body,'utf-8')); 
	// returns a Buffered payload, so the it will be treated as a binary content.
};

