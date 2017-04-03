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
			{ value: b, writable: true, enumerable: true, configurable: true })
			return o;
		}
		var header = part.header.split(';');		
		var file = obj(header[2]);
		var contentType = part.info.split(':')[1].trim();		
		Object.defineProperty( file , 'type' , 
			{ value: contentType, writable: true, enumerable: true, configurable: true })
		Object.defineProperty( file , 'data' , 
			{ value: new Buffer(part.part), writable: true, enumerable: true, configurable: true })
		return file;
	}
	var prev = null;
	var lastline='';
	var header = '';
	var info = ''; var state=0; var buffer=[];
	var allParts = [];

	for(i=0;i<multipartBodyBuffer.length;i++){
		var oneByte = multipartBodyBuffer[i];
		var prevByte = i > 0 ? multipartBodyBuffer[i-1] : null;
		var newLineDetected = ((oneByte == 0x0a) && (prevByte == 0x0d)) ? true : false;
		var newLineChar = ((oneByte == 0x0a) || (oneByte == 0x0d)) ? true : false;
		
		if(!newLineChar)
			lastline += String.fromCharCode(oneByte);
		
		//console.log('ST='+state,'LN='+lastline,'BF='+JSON.stringify(buffer));

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
			lastline='';
		}else
		if(4 == state){
			if((("--"+boundary+"--") == lastline)){
				var j = buffer.length - lastline.length;
				var part = new Buffer(buffer.slice(0,j-1));
				var p = { header : header , info : info , part : part  };
				allParts.push(process(p));
				break;
			}else
			if((("--"+boundary) == lastline)){
				var j = buffer.length - lastline.length;
				var part = new Buffer(buffer.slice(0,j-1));
				var p = { header : header , info : info , part : part  };
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
	return allParts;
};

//  read the boundary from the content-type header sent by the http client
//  this value may be similar to:
//  'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B',
exports.getBoundary = function(header){
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
	body += "header1\r\n";
	body += "info1\r\n";
	body += "\r\n\r\n";
	body += "111X";
	body += "111Y\r\n";
	body += "111Z\rCCCC\nCCCC\r\nCCCCCX\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n";
	body += "header2\r\n";
	body += "info2\r\n";
	body += "\r\n\r\n";
	body += "222X";
	body += "222Y\r\n";
	body += "222Z\r222W\n2220\r\n666X\r\n";
	body += "------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n";
	return body;
};

