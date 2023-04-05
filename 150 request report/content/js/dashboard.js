/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 53.0, "KoPercent": 47.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.012916666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08333333333333333, 500, 1500, "Sign up for Newsletter "], "isController": false}, {"data": [0.0, 500, 1500, "Teens make health happen"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Financials "], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Resources"], "isController": false}, {"data": [0.0, 500, 1500, "living labs"], "isController": false}, {"data": [0.0, 500, 1500, "Show Program Plans"], "isController": false}, {"data": [0.02, 500, 1500, "Show Donate Now"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Home page"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 564, 47.0, 2168.237500000001, 294, 6720, 2709.5, 4042.4000000000005, 4553.350000000008, 6236.47, 46.10596688054713, 13.61942045760172, 5.965859972336419], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Sign up for Newsletter ", 150, 37, 24.666666666666668, 2080.9866666666644, 304, 4202, 2562.0, 3775.2000000000003, 3926.149999999999, 4159.670000000001, 7.165719199350308, 2.0460554208665744, 0.888717127263173], "isController": false}, {"data": ["Teens make health happen", 150, 104, 69.33333333333333, 1413.8133333333335, 296, 4206, 323.0, 3996.8, 4067.3999999999996, 4191.21, 13.467408870533308, 4.024966612048842, 1.6045155099658825], "isController": false}, {"data": ["HealthCorps Financials ", 150, 85, 56.666666666666664, 1848.7200000000003, 295, 4306, 337.0, 4051.3, 4123.3, 4269.280000000001, 10.285244103126715, 3.089590904415798, 1.3760531661409765], "isController": false}, {"data": ["HealthCorps Resources", 150, 57, 38.0, 2299.16, 294, 4389, 3107.5, 3857.9, 3986.7, 4358.400000000001, 7.630869410388157, 2.2542363248461106, 1.013474843567177], "isController": false}, {"data": ["living labs", 150, 70, 46.666666666666664, 2128.673333333333, 300, 4142, 3233.5, 3987.7, 4031.35, 4136.39, 8.55773619351894, 2.635292460634414, 1.3037176232314014], "isController": false}, {"data": ["Show Program Plans", 150, 118, 78.66666666666667, 1096.9733333333334, 294, 4273, 322.0, 4026.6, 4143.8, 4252.09, 20.09646302250804, 6.140411475080385, 2.6886869473472665], "isController": false}, {"data": ["Show Donate Now", 150, 43, 28.666666666666668, 2315.5399999999995, 301, 4143, 2977.0, 3797.1, 3917.249999999999, 4119.540000000001, 7.3471786833855806, 2.112744370224334, 0.9183973354231975], "isController": false}, {"data": ["HealthCorps Home page", 150, 50, 33.333333333333336, 4162.033333333332, 2097, 6720, 3395.0, 6140.2, 6483.8, 6718.47, 21.422450728363323, 6.039011175378463, 2.4476823586118255], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 564, 100.0, 47.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 564, "429/Too Many Requests", 564, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Sign up for Newsletter ", 150, 37, "429/Too Many Requests", 37, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Teens make health happen", 150, 104, "429/Too Many Requests", 104, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Financials ", 150, 85, "429/Too Many Requests", 85, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Resources", 150, 57, "429/Too Many Requests", 57, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["living labs", 150, 70, "429/Too Many Requests", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Program Plans", 150, 118, "429/Too Many Requests", 118, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Donate Now", 150, 43, "429/Too Many Requests", 43, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Home page", 150, 50, "429/Too Many Requests", 50, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
