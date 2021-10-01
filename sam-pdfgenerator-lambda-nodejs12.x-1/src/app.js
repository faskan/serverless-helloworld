// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

 'use strict';

 const PDFKit = require("pdfkit")
 const fs = require("fs");
 const PDFDocument = require("pdfkit");
 
 const invoice = {
   shipping: {
     name: "John Doe",
     address: "1234 Main Street",
     city: "San Francisco",
     state: "CA",
     country: "US",
     postal_code: 94111
   },
   items: [
     {
       item: "TC 100",
       description: "Toner Cartridge",
       quantity: 2,
       amount: 6000
     },
     {
       item: "USB_EXT",
       description: "USB Cable Extender",
       quantity: 1,
       amount: 2000
     }
   ],
   subtotal: 8000,
   paid: 0,
   invoice_nr: 1234
 };
exports.lambdaHandler = async (event, context) => {
    return new Promise(resolve => {
        let doc = new PDFDocument({ margin: 50 });
  
        generateHeader(doc);
        generateCustomerInformation(doc, invoice);
        generateInvoiceTable(doc, invoice);
        generateFooter(doc);
  
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
        });
        
        doc.end();
        //doc.pipe(fs.createWriteStream("/tmp/test.pdf"));
      });
};


function generateHeader(doc) {
    doc
      .image("logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("ACME Inc.", 110, 57)
      .fontSize(10)
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("New York, NY, 10025", 200, 80, { align: "right" })
      .moveDown();
  }
  
  function generateFooter(doc) {
    doc
      .fontSize(10)
      .text(
        "Payment is due within 15 days. Thank you for your business.",
        50,
        780,
        { align: "center", width: 500 }
      );
  }
  
  function generateCustomerInformation(doc, invoice) {
    const shipping = invoice.shipping;
  
    doc
      .text(`Invoice Number: ${invoice.invoice_nr}`, 50, 200)
      .text(`Invoice Date: ${new Date()}`, 50, 215)
      .text(`Balance Due: ${invoice.subtotal - invoice.paid}`, 50, 130)
  
      .text(shipping.name, 300, 200)
      .text(shipping.address, 300, 215)
      .text(`${shipping.city}, ${shipping.state}, ${shipping.country}`, 300, 130)
      .moveDown();
  }
  
  function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 150, y)
      .text(c3, 280, y, { width: 90, align: "right" })
      .text(c4, 370, y, { width: 90, align: "right" })
      .text(c5, 0, y, { align: "right" });
  }
  
  function generateInvoiceTable(doc, invoice) {
    let i,
      invoiceTableTop = 330;
  
    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.item,
        item.description,
        item.amount / item.quantity,
        item.quantity,
        item.amount
      );
    }
  }