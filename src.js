/*  (c) UEJ.
 *  Author: Woodfish
 *  Date: Mar 18 02:36 am
 */



var datass = '';
var DataArr = [];
PDFJS.workerSrc = '';

function ExtractText(url) {
    url = "https://community.theultimateeconomicsjournal.com/proxy?url=" + url;
    fetch(url).then(function(t) {
        return t.blob().then((b) => {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.setAttribute("download", "uej.pdf");
            var fReader = new FileReader();
            fReader.readAsDataURL(b);
            // console.log(input.files[0]);
            fReader.onloadend = function (event) {
                convertDataURIToBinary(event.target.result);
            }
        });
    });
}

var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array)

}

function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}

function pdfAsArray(pdfAsArray) {

    PDFJS.getDocument(pdfAsArray).then(function (pdf) {

        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < 3; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {

            // Display text of all the pages in the console
            // e.g ["Text content page 1", "Text content page 2", "Text content page 3" ... ]

            var index = -1;

            for (var i = 0; i < pagesText.length; i++) {
                var pt = pagesText[i];

                // manipulate text to find 'abstract' and extract it
                if ((index = pt.search(/abstract/i)) != -1) {
                    var text = pt.substr(index + 9, 200) + '...';
                    console.log(text);
                }

            }
        });

    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

function clip(str, n) {
    // reduce string by a particular number
    var nstr = "";
    for (var i = 0; i < n; i++) 
        if (str[i]) nstr += str[i];

    return nstr + "...";
}

function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

let topics = [ 
    "Economics",
    "Business",
    "Social Science",
    "Humanities",
    "Agriculture",
    "International Development",
    "Economic Development"
];

topics = shuffle(topics);

fetch ("https://api.unpaywall.org/v2/search/?query=" + topics[0] + "|" + topics[1] + "|" + topics[2] + "&is_oa=true&email=jasonholt2002@gmail.com", {
    method: 'get',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(res => (function () {
    var pj = JSON.parse(JSON.stringify(res, null, 2));
    
    for (var i = 0; i < 3; i++) {
        var r = pj["results"][i].response;

        console.log("Title: " + clip(r.title, 100));
        console.log("URL: " + r.best_oa_location.url_for_pdf);
        console.log("Abstract: ");

        if (r.best_oa_location.url_for_pdf) {
            ExtractText(r.best_oa_location.url_for_pdf);
        }

        console.log("Updated: " + r.updated);
        console.log("Publisher: " + r.publisher);
    }
})());


