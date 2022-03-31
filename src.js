/*  (c) UEJ.
 *  Author: Woodfish
 *  Date: Mar 18 02:36 am
 */



// var datass = '';
// var DataArr = [];
// PDFJS.workerSrc = '';

// function ExtractText(url) {
//     url = "https://community.theultimateeconomicsjournal.com/proxy?url=" + url;
//     fetch(url).then(function(t) {
//         return t.blob().then((b) => {
//             var a = document.createElement("a");
//             a.href = URL.createObjectURL(b);
//             a.setAttribute("download", "uej.pdf");
//             var fReader = new FileReader();
//             fReader.readAsDataURL(b);
//             // console.log(input.files[0]);
//             fReader.onloadend = function (event) {
//                 convertDataURIToBinary(event.target.result);
//             }
//         });
//     });
// }

// var BASE64_MARKER = ';base64,';

// function convertDataURIToBinary(dataURI) {

//     var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
//     var base64 = dataURI.substring(base64Index);
//     var raw = window.atob(base64);
//     var rawLength = raw.length;
//     var array = new Uint8Array(new ArrayBuffer(rawLength));

//     for (var i = 0; i < rawLength; i++) {
//         array[i] = raw.charCodeAt(i);
//     }
//     pdfAsArray(array)

// }

// function getPageText(pageNum, PDFDocumentInstance) {
//     // Return a Promise that is solved once the text of the page is retrieven
//     return new Promise(function (resolve, reject) {
//         PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
//             // The main trick to obtain the text of the PDF page, use the getTextContent method
//             pdfPage.getTextContent().then(function (textContent) {
//                 var textItems = textContent.items;
//                 var finalString = "";

//                 // Concatenate the string of the item to the final string
//                 for (var i = 0; i < textItems.length; i++) {
//                     var item = textItems[i];

//                     finalString += item.str + " ";
//                 }

//                 // Solve promise with the text retrieven from the page
//                 resolve(finalString);
//             });
//         });
//     });
// }

// function pdfAsArray(pdfAsArray) {

//     PDFJS.getDocument(pdfAsArray).then(function (pdf) {

//         var pdfDocument = pdf;
//         // Create an array that will contain our promises
//         var pagesPromises = [];

//         for (var i = 0; i < 3; i++) {
//             // Required to prevent that i is always the total of pages
//             (function (pageNumber) {
//                 // Store the promise of getPageText that returns the text of a page
//                 pagesPromises.push(getPageText(pageNumber, pdfDocument));
//             })(i + 1);
//         }

//         // Execute all the promises
//         Promise.all(pagesPromises).then(function (pagesText) {

//             // Display text of all the pages in the console
//             // e.g ["Text content page 1", "Text content page 2", "Text content page 3" ... ]

//             var index = -1;

//             for (var i = 0; i < pagesText.length; i++) {
//                 var pt = pagesText[i];

//                 // manipulate text to find 'abstract' and extract it
//                 if ((index = pt.search(/abstract/i)) != -1) {
//                     var text = pt.substr(index + 9, 200) + '...';
//                     console.log(text);
//                 }

//             }
//         });

//     }, function (reason) {
//         // PDF loading error
//         console.error(reason);
//     });
// }

/*
 * (c) UEJ.
 * Author: Woodfish
 * Date: Mar 30 19:45
 */

function clip(str, n) {
    // reduce string by a particular number
    if (str.length > n) {
        var nstr = "";
        for (var i = 0; i < n; i++) 
            if (str[i]) nstr += str[i];

        str = nstr + "...";
    }
    
    return str;
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

var tpcs = [ 
    "Economics",
    "Business",
    "Social Science",
    "Humanities",
    "Agriculture",
    "International Development",
    "Economic Development"
];


// determines whether to load more for a search or for the normal feed
var flag = true;


function rollDice() {
    flag = true;
    tpcs = shuffle(tpcs);
}

var str = tpcs[0] + "|" + tpcs[1] + "|" + tpcs[2];

function loadData(str) {
    if (qs('.container')) {
        fetch ("https://api.unpaywall.org/v2/search/?query=" + str + "&is_oa=true&email=jasonholt2002@gmail.com", {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => (function () {
            var pj = JSON.parse(JSON.stringify(res, null, 2));
            
            for (var i = 0; i < 23; i++) {
                if (pj["results"][i]) {
                    var r = pj["results"][i].response;

                    var authors = '';
                    for (var j = 0; r.z_authors && j < r.z_authors.length; j++) {
                        authors += (r.z_authors[j].given + r.z_authors[j].family) + "**&**";
                    };
                    
                style(clip(r.title, 180), r.journal_issns, r.best_oa_location.url_for_pdf, authors, r.published_date, r.publisher)
                }
            }
        })());
    }
}

function ce(tag) {
    return document.createElement(tag);
}


function qs(val) {
    return document.querySelector(val);
}

function style(title, issn, url, authors, date, publisher) {
    // add the information to DOM
    var d1 = ce('div');
    d1.className = "uej-main";

    var d2 = ce('div');
    d2.className = "uej-name";
    d2.innerHTML = span('Title: ', 'uej-label') + span(title, 'uej-span uej-art-name');

    var d3 = ce('div');
    d3.className = "uej-issn";
    d3.innerHTML = span('ISSN: ', 'uej-label') + span(issn), 'uej-span';

    var d4 = ce('div');
    d4.className = "uej-url";
	url = url == null ? "Not available" : url;
    d4.innerHTML = span('URL: ', 'uej-label') + "<a class='uej-url-i' href='" + url + "'>" + url + "</a>";

    // parse authors
    var a = authors.split('**&**');

    var d0 = ce('div');
    d0.className = "uej-authors";
	var com = '';

    for (var i = 0; i < a.length && i < 5; i++) 
    	if (a[i] && a[i] != "NaN") com += span(a[i], 'uej-auth');
	
    d0.innerHTML = span('Authors: ', 'uej-label') + com;
	

    var d5 = ce('div');
    d5.className = "uej-date";
    d5.innerHTML = span('Date of Publication: ', 'uej-label') + span(date), 'uej-span';

    var d6 = ce('div');
    d6.className = "uej-pub";
    d6.innerHTML = span('Published by: ', 'uej-label') + span(publisher), 'uej-span';
    
    // clean up
    d1.appendChild(d2);
    d1.appendChild(d3);
    d1.appendChild(d4);
    d1.appendChild(d0);
    d1.appendChild(d5);
    d1.appendChild(d6);
    
    qs('.uej-container').appendChild(d1);

    // restore load more text
    qs(".uej-loadmore").innerText = "Load More";
}

function span(text, clas_s) {
    return "<span class='" + clas_s + "'>" + text + "</span>";
}

window.addEventListener('load', (e) => {
    rollDice();
    loadData(str);
}, false);

document.body.addEventListener('click', (e) => {
    if (e.target.className == "uej-loadmore") {
        if (flag) {
            rollDice();
            loadData(str);
        } else 
            loadData(qs(".uej-search").value);

        e.target.innerText = "loading...";
    }
    else if (e.target.className == "uej-search-btn") {
        // search
		e.preventDefault();
		
        if (qs(".uej-search").value) {
			qs(".uej-container").innerHTML = "";
			qs(".uej-loadmore").innerText = "loading...";

			// no need to roll dice
			flag = false;
			console.log(flag);

			loadData(qs(".uej-search").value);
		}
    }
}, false);
