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

    var data = {"OkPercent": 39.9375, "KoPercent": 60.0625};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0103125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0675, 500, 1500, "Sign up for Newsletter "], "isController": false}, {"data": [0.0, 500, 1500, "Teens make health happen"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Financials "], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Resources"], "isController": false}, {"data": [0.0, 500, 1500, "living labs"], "isController": false}, {"data": [0.0, 500, 1500, "Show Program Plans"], "isController": false}, {"data": [0.015, 500, 1500, "Show Donate Now"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Home page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1600, 961, 60.0625, 2087.394374999999, 292, 9998, 450.0, 5341.6, 6545.249999999997, 8512.95, 58.215689128220056, 17.382769861555815, 7.532791806141755], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Sign up for Newsletter ", 200, 88, 44.0, 1596.5200000000004, 303, 4193, 843.0, 3860.3, 4051.4499999999994, 4176.83, 10.87311079699902, 3.174438675655105, 1.3485205773621833], "isController": false}, {"data": ["Teens make health happen", 200, 162, 81.0, 1099.5149999999999, 297, 4889, 403.0, 4068.7000000000003, 4151.9, 4740.200000000002, 16.65833749791771, 5.052649456521739, 1.9846847409628519], "isController": false}, {"data": ["HealthCorps Financials ", 200, 150, 75.0, 1225.8500000000001, 292, 4381, 363.5, 3933.5, 4059.7, 4257.67, 14.702639123722708, 4.479710358009263, 1.9670523046386827], "isController": false}, {"data": ["HealthCorps Resources", 200, 115, 57.5, 1605.2299999999998, 303, 4376, 374.0, 3915.9, 4089.7, 4277.67, 11.374623215605983, 3.4143308700164936, 1.5106921458226699], "isController": false}, {"data": ["living labs", 200, 133, 66.5, 1414.8149999999998, 303, 4324, 354.0, 3831.7000000000003, 3943.2, 4277.150000000001, 12.765685836471565, 3.9434624728729175, 1.944772451649965], "isController": false}, {"data": ["Show Program Plans", 200, 151, 75.5, 1782.7250000000001, 304, 5357, 1164.0, 5075.5, 5202.45, 5350.81, 20.650490449148165, 6.294366288074341, 2.762809757356737], "isController": false}, {"data": ["Show Donate Now", 200, 108, 54.0, 1520.3350000000003, 307, 4274, 406.0, 3819.4, 3987.0, 4204.8200000000015, 11.085245538188671, 3.2781582557366145, 1.3856556922735837], "isController": false}, {"data": ["HealthCorps Home page", 200, 54, 27.0, 6454.165000000001, 4330, 9998, 6163.5, 8292.7, 8875.55, 9903.890000000001, 18.39249586168843, 5.1348112470112195, 2.1014863435718225], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 961, 100.0, 60.0625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1600, 961, "429/Too Many Requests", 961, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Sign up for Newsletter ", 200, 88, "429/Too Many Requests", 88, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Teens make health happen", 200, 162, "429/Too Many Requests", 162, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Financials ", 200, 150, "429/Too Many Requests", 150, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Resources", 200, 115, "429/Too Many Requests", 115, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["living labs", 200, 133, "429/Too Many Requests", 133, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Program Plans", 200, 151, "429/Too Many Requests", 151, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Donate Now", 200, 108, "429/Too Many Requests", 108, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Home page", 200, 54, "429/Too Many Requests", 54, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
