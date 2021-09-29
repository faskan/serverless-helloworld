'use strict';

const PDFKit = require("pdfkit")

module.exports = {
  generatePdf: async (event) => {
    const text = event.queryStringParameters.text || 'Hello world';

    return new Promise(resolve => {
      const doc = new PDFKit()

      doc.text(text)

      const buffers = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdf = Buffer.concat(buffers)
        const response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/pdf",
          },
          body: pdf.toString("base64"),
          isBase64Encoded: true,
        }
        resolve(response);
      })

      doc.end()
    });
  },

  authorizerFunc: (event, context, callback) => {
    var token = event.authorizationToken;
    console.log("TOKEN: " + token);
    switch (token) {
      case 'allow':
        callback(null, generatePolicy('user', 'Allow', event.methodArn));
        break;
      case 'deny':
        callback(null, generatePolicy('user', 'Deny', event.methodArn));
        break;
      case 'unauthorized':
        callback("Unauthorized");   // Return a 401 Unauthorized response
        break;
      default:
        callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
  }
}

// Help function to generate an IAM policy
var generatePolicy = (principalId, effect, resource) => {
  var authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    "stringKey": "stringval",
    "numberKey": 123,
    "booleanKey": true
  };
  return authResponse;
}