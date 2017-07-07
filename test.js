/**
    this is a tester, it enables you to debug your request.

    1. USAGE:

      Provide two values: body and contentType and put them in the
      respective variables, then execute:

      $ node test
    
    2. OBTAINING THE BODY AND CONTENT-TYPE UNDER AMAZON APIGATEWAY+LAMBDA:
    
      if you are runnig this library on Amazon Aws (ApiGateway) then put
      this line in the very beggining of your lambda function:

         console.log(JSON.stringify(event));
    
      it will provide you with something similar to (see logs in CloudWatch):

      ```
        2017-07-05T23:17:58.956Z    2f01d974-61d8-11e7-9b9a-87f6b4f45038    event=
        {
            "body-json": "LS0tLS0tV2ViS........",
            "params": {
                "path": {},
                "querystring": {},
                "header": {
                    "Accept": "/",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.6,en;q=0.4",
                    "CloudFront-Is-Tablet-Viewer": "false",
                    "CloudFront-Viewer-Country": "JP",
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryoCaPJuwCGZB5G5Jq",
                ...
                }
            }
        }
      ```
    from this log, copy and paste the values for: "body-json" and "content-type".
*/
var multipart = require('./multipart.js');

var body = "LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5b0NhUEp1d0NHWkI1RzVKcQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJ0ZXN0TWVzc2FnZSINCg0KdGVzdCBtZXNzYWdlIDEyMzU2DQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlvQ2FQSnV3Q0daQjVHNUpxDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InRlc3RGaWxlIjsgZmlsZW5hbWU9IjEyMy50Z3oiDQpDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL3gtY29tcHJlc3NlZA0KDQofiwgIgd9cWQALMTIzLnRhcgDtzjEOwCAMQ1FOVBG7CRdj6PEbGNkjFr/lS55s4DO/2Sr1NNx309nEZjREvB0Da/dgtvSVLAbeviAiIhf8UCKb4gAIAAANCi0tLS0tLVdlYktpdEZvcm1Cb3VuZGFyeW9DYVBKdXdDR1pCNUc1SnEtLQ0K";
var contentType='multipart/form-data; boundary=----WebKitFormBoundaryoCaPJuwCGZB5G5Jq';
var boundary=null;

// activate this line to utilize the body and content type defined above
// body = new Buffer(body,'base64'); boundary = multipart.getBoundary(contentType);

// activate this line to utilize the demo data
body = multipart.DemoData(); boundary="----WebKitFormBoundaryvef1fLxmoUdYZWXp";

var parts = multipart.Parse(body,boundary);
for(var i=0;i<parts.length;i++){
    var part = parts[i];
    console.log(part);
    if('NOT_A_FILE' != part.filename) require("fs").writeFile(
        '/tmp/'+part.filename,part.data,function(err){ 
                console.log('file saved at:','/tmp/'+part.filename); });
}
