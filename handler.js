'use strict';

const PDFKit = require("pdfkit")

module.exports.generatePdf = async (event) => {
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
}