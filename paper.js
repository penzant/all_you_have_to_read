// from November, 2016
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function filter(typ, target) {
    var secs = document.getElementsByTagName("section");
    for (i = 0; i < secs.length; i++) {
        if (target == 'all') {
            secs[i].setAttribute("style", "");
            continue;
        }
        if (secs[i].getAttribute(typ).split(", ").indexOf(target) < 0) {
            secs[i].setAttribute("style", "display: none;");
        } else {
            secs[i].setAttribute("style", "");
        }
    }
}

function sortItem(typ) {
    var secs = [].slice.call(document.getElementsByTagName("section"));
    secs.sort(function(a, b) {
        if (typ == "original") {
            return b.getAttribute("num") - a.getAttribute("num")
        }
        if (typ == "year") {
            var n = b.getElementsByClassName("year")[0].innerHTML - a.getElementsByClassName("year")[0].innerHTML;
            if (n !== 0) return n;
        }
        var at = a.getElementsByClassName("title")[0].innerHTML;
        var bt = b.getElementsByClassName("title")[0].innerHTML;
        if (at > bt) return 1;
        if (bt > at) return -1;
        return 0;
    });
    document.getElementById("items").innerHTML = secs.map(x=>x.outerHTML).join("");
}

function parseItem(t, u, m, tag, year, num) {
    var msg = "";
    msg += '<section tags="' + tag + '" year="' + year + '" num="' + num + '">';
    msg += '<div class="title">' + t + '</div>';
    msg += u !="-" ? '<div class="url"><a target="_blank" href="' + u + '">' + u + '</a></div>': "-";
    msg += '<div class="tag">' + tag + '</div>';
    msg += '<div class="year">' + year + '</div>';
    msg += '<div class="memo">' + (m != "-" ? '<pre>' + m + '</pre>' : '<span class="unread"></span>') + '</div>';
    msg += "</section>";
    return msg;
}

function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

function genLinks(typ, li) {
    var  count = {}; 
    li.forEach(function(i) { count[i] = (count[i]||0)+1;  });
    li = li.filter(function (x, i, self) {
        return self.indexOf(x) === i;
    });
    var reslinks = [];
    reslinks.push('<a href="javascript:void(0)" onclick="filter(\'' + typ + '\',\'all\'); return false;">all</a>');
    for (var i = 0; i < li.length; i++) {
        var t = li[i];
        var s = '<a href="javascript:void(0)" onclick="filter(\'' + typ + '\',\'' + t + '\'); return false;">' + t.capitalizeFirstLetter() + "(" + count[t].toString() + ")</a>";
        var fsize = 1 + (sigmoid((count[t]-1)*0.5) - 0.5) * 0.7;
        s = '<a href="javascript:void(0)" onclick="filter(\'' + typ + '\',\'' + t + '\'); return false;" style="font-size:' + fsize + 'em">' + t.capitalizeFirstLetter() + "(" + count[t].toString() + ")</a>";
        reslinks.push(s);
    }
    return reslinks;
}

function parseJSON(x) {
    var colnum = 5;
    var xparse = JSON.parse(x);
    var idlist = xparse.feed.entry;
    var dict = {};
    for (i=1;i<=colnum;i++) dict[i] = [];
    var counter = 0;
    var unread = 0;
    for (var i=0; i < idlist.length; i++) {
        var tmpitem = idlist[i].gs$cell;
        while (tmpitem.col != counter % colnum + 1) {
            dict[counter % colnum + 1].push("-");
            if (counter % colnum + 1 == 3) {
                unread++;
            }
            counter++;
        }
        dict[tmpitem.col].push(tmpitem.$t);//.replace(/(http:\/\/[^\s]+)/gi, '<a href="$1">$1</a>'));
        counter++;
    };
    var ret = "";
    var tags = [], years = [];
    for (var i = 0; i < dict[1].length; i++) {
        ret = parseItem(dict[1][i], dict[2][i], dict[3][i], dict[4][i], dict[5][i], i+1) + ret;
        tags = tags.concat(dict[4][i] ? dict[4][i].trim().split(","): "");
        years = years.concat(dict[5][i] ? dict[5][i].trim() : "");
    }
    var taglinks = genLinks('tags', tags.map(s => s.trim()).sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
}));
    var yearlinks = genLinks('year', years.map(s => s.trim()).sort().reverse());
    if (ret) {
        document.getElementById("update").innerHTML = "Updated: " + xparse.feed.updated.$t;
        document.getElementById("counter").innerHTML = '<span class="counter">Total/Unread: ' + (counter / colnum) + ' / ' + unread + "</span>";
        document.getElementById("tags").innerHTML = "Tag: <span class='tag'>" + taglinks.join(", ") + "</span>";
        document.getElementById("years").innerHTML = "Year: <span class='year'>" + yearlinks.join(", ") + "</span>";
        document.getElementById("sorting").innerHTML = "Sort: <span class='sorting'><a href='javascript:void(0)' onclick='sortItem(\"year\"); return false;'>year</a> / <a href='javascript:void(0)' onclick='sortItem(\"title\"); return false;'>title</a> / <a href='javascript:void(0)' onclick='sortItem(\"original\"); return false;'>original</a></span>";
        document.getElementById("items").innerHTML = ret;
    } else {
        document.getElementById("debug").innerHTML = "Load error";
    }
}

function loadData() {
    xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 && xmlhttp.status==200){
                parseJSON(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET",targetpath,true);
    xmlhttp.send(null);
}

loadData();
