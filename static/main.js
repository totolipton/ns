var searchtopic;

var cxhr;

var getSummary = function() {
    if (cxhr) {
        try {
            cxhr.abort();
        } catch(e) {
            console.warn(e)
        }
    }
    var searchComplete = function () {
        var outputfail = function () {
            document.getElementById("summary").innerHTML = "Oops, something went wrong and I can't build a summary";
        }

        function renderResult(data) {
            var summaryEl = document.getElementById("summary");
            summaryEl.innerHTML = "";
            var p = document.createElement("p");
            p.innerHTML = data.summary
            summaryEl.appendChild(p);

            if (data.images && data.images[0]) {
                var mainimg = document.createElement("img");
                mainimg.setAttribute("src", data.images[0])
                mainimg.className = "mainimage"
                summaryEl.appendChild(mainimg)
            }

            var sourcesEl = document.createElement("div");
            sourcesEl.className = "sources";
            var ul = document.createElement("ul");
            var links = data.links
            var names = data.names
            var lis = _.map(_.zip(links, names), function (linkNamePair) {
                var li = document.createElement("li");
                li.innerHTML = '<a href="' + linkNamePair[0] + '">' + linkNamePair[1] + '</a>';
                return li
            });
            _.each(lis, ul.appendChild, ul);
            var sourcep = document.createElement("p");
            sourcep.innerHTML = "<br/>Sources:";
            sourcesEl.appendChild(sourcep);
            sourcesEl.appendChild(ul);
            summaryEl.appendChild(sourcesEl);
        }


        var fetchResult = function (tid, ntry) {
            var rxhr = $.ajax({
                type: 'GET',
                url: 'getsummary' + '/' + tid,
                contentType: "application/json",
                cache: false,
                dataType: 'json'
            }).done(function(data) {
                if (data.status === "done") {
                    renderResult(data)
                }
                else {
                    if (ntry < 25) {
                        setTimeout(fetchResult, 1000, tid, ntry + 1);
                    }
                    else {
                        outputfail();
                    }
                }
            }).fail(outputfail);
        };

        cxhr = $.ajax({
            type: 'POST',
            url: 'summarize',
            contentType: "application/json",
            data: JSON.stringify({
                topic: searchtopic,
                words: 100
            }),
            dataType: 'json'
        }).then(function(data) {
            if (data.summary) {
                return renderResult(data);
            } else {
                console.log('fetching result');
                return fetchResult(data.task, 0);
            }
        }).fail(outputfail);

    };

    searchtopic = document.querySelector("#topic").value;
    searchComplete();
    document.getElementById("summary").innerHTML = "Building a summary...";

}

document.querySelector("#topic").addEventListener(
    "keypress",
    function(event) {
        if (event.keyCode === 13) {
            getSummary();
        }
    })

// document.querySelector("#topic").addEventListener(
//     "keypress", _.debounce(getSummary, 500))

