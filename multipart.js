/**
 	Multipart Parser (Finite State Machine)

	usage:

	var multipart = require('./multipart.js');
	var body = multipart.DemoData(); 							   // raw body
	var body = new Buffer(event['body-json'].toString(),'base64'); // AWS case
	
	var boundary = multipart.getBoundary(event.params.header['content-type']);
	var parts = multipart.Parse(body,boundary);
	
	// each part is:
	// { filename: 'A.txt', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }

	author:  Cristian Salazar (christiansalazarh@gmail.com) www.chileshift.cl
			 Twitter: @AmazonAwsChile
 */
exports.Parse = function(multipartBodyBuffer,boundary){
	var process = function(part){
		//console.log('part', part);
		// will transform this object:
		// { header: 'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"',
		//	 info: 'Content-Type: text/plain',
		//	 part: 'AAAABBBB' }
		// into this one:
		// { filename: 'A.txt', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }
		var obj = function(str){
			var k = str.split('=');
			var a = k[0].trim();
			var b = JSON.parse(k[1].trim());
			var o = {};
			Object.defineProperty( o , a , 
			{ value: b, writable: true, enumerable: true, configurable: true });
			return o;
		}
		var header = part.header.split(';');
        var file = obj(header[2] ? header[2] : 'filename=\"NOT_A_FILE\"');
        var contentType = (part.info) ? (part.info.split(':')[1].trim()) : 'text/plain';
		Object.defineProperty( file , 'type' , 
			{ value: contentType, writable: true, enumerable: true, configurable: true })
		
		if(contentType === 'text/plain') {
				Object.defineProperty( file , 'data' , 
			{ value: new Buffer(part.value), writable: true, enumerable: true, configurable: true })
		} else {
				Object.defineProperty( file , 'data' , 
			{ value: new Buffer(part.part), writable: true, enumerable: true, configurable: true })	
		}
        return file;
	}
	var prev = null;
	var lastline='';
	var header = '';
	var info = ''; var state=0; var buffer=[];
	var value = '';
	var allParts = [];

	for(var i=0;i<multipartBodyBuffer.length;i++){
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
			header = lastline;
			state=2;
			lastline='';
		}else
		if((2 == state) && newLineDetected){
			info = lastline;
			state=3;
			lastline='';
		}else
		if((3 == state) && newLineDetected){
			state=4;
			buffer=[];
			value = lastline;
			lastline='';
		}else
		if(4 == state){
			if(lastline.length > (boundary.length+4)) lastline=''; // mem save
			if(((("--"+boundary) == lastline))){
				var j = buffer.length - lastline.length;
				var part = buffer.slice(0,j-1);
				var p = { header : header , info : info , part : part , value : value  };
				allParts.push(process(p));
				buffer = []; lastline=''; state=5; header=''; info=''; value='';
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
	return allParts;
};

//  read the boundary from the content-type header sent by the http client
//  this value may be similar to:
//  'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B',
exports.getBoundary = function(header){
	var items = header.split(';');
	if(items)
		for(var j=0;j<items.length;j++){
			var item = (new String(items[j])).trim();
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
	body += "Content-Disposition: form-data; name=\"testMessage\";\r\n";
	body += "\r\n\r\n";
	body += "test message 123456\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
	body += "Content-Disposition: form-data; name=\"uploads[]\"; filename=\"C.txt\"\r\n";
	body += "Content-Type: text/plain\r\n",
	body += "\r\n\r\n";
	body += "@CCC";
	body += "CCCY\r\n";
	body += "CCCZ\rCCCW\nCCC0\r\n666@\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n";
	return (new Buffer(body,'utf-8')); 
	// returns a Buffered payload, so the it will be treated as a binary content.
};

