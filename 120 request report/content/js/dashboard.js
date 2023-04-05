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

    var data = {"OkPercent": 69.0625, "KoPercent": 30.9375};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.014583333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.10833333333333334, 500, 1500, "Sign up for Newsletter "], "isController": false}, {"data": [0.0, 500, 1500, "Teens make health happen"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Financials "], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Resources"], "isController": false}, {"data": [0.0, 500, 1500, "living labs"], "isController": false}, {"data": [0.0, 500, 1500, "Show Program Plans"], "isController": false}, {"data": [0.008333333333333333, 500, 1500, "Show Donate Now"], "isController": false}, {"data": [0.0, 500, 1500, "HealthCorps Home page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 960, 297, 30.9375, 2940.207291666668, 296, 10523, 3680.5, 5149.499999999998, 6938.749999999998, 8333.72, 33.647611370088676, 9.772744449020363, 4.3538169009147945], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Sign up for Newsletter ", 120, 9, 7.5, 2499.2500000000005, 312, 4126, 2752.5, 3887.8, 4003.2, 4117.599999999999, 6.677424739858661, 1.868570370318847, 0.8281571698848145], "isController": false}, {"data": ["Teens make health happen", 120, 68, 56.666666666666664, 1942.8166666666666, 298, 4430, 356.5, 4190.5, 4274.849999999999, 4415.929999999999, 11.519631371796104, 3.387266607468561, 1.372456081405395], "isController": false}, {"data": ["HealthCorps Financials ", 120, 67, 55.833333333333336, 1923.0749999999996, 303, 4357, 366.0, 4076.8, 4195.75, 4354.0599999999995, 9.436929852154766, 2.8329221060081786, 1.2625579977980497], "isController": false}, {"data": ["HealthCorps Resources", 120, 42, 35.0, 2479.025, 296, 4231, 3452.5, 4010.9, 4102.3, 4218.4, 6.32211158526948, 1.8629855184131499, 0.8396554449186028], "isController": false}, {"data": ["living labs", 120, 49, 40.833333333333336, 2463.8416666666662, 303, 4374, 3725.5, 4105.8, 4164.65, 4364.549999999999, 7.395538025391347, 2.2752955326328115, 1.1266639960557132], "isController": false}, {"data": ["Show Program Plans", 120, 38, 31.666666666666668, 2911.7916666666665, 306, 4595, 3972.0, 4303.9, 4337.7, 4552.789999999998, 14.366096013408356, 4.23126421644918, 1.9220265174188915], "isController": false}, {"data": ["Show Donate Now", 120, 21, 17.5, 2763.0583333333343, 302, 4191, 3495.0, 4050.3, 4137.0, 4187.01, 6.109046479661966, 1.7347245997301837, 0.7636308099577457], "isController": false}, {"data": ["HealthCorps Home page", 120, 3, 2.5, 6538.799999999998, 4299, 10523, 6506.0, 8189.700000000001, 8700.249999999998, 10473.859999999999, 10.814708002883922, 2.9053966519466474, 1.2356648792357605], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 297, 100.0, 30.9375], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 960, 297, "429/Too Many Requests", 297, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Sign up for Newsletter ", 120, 9, "429/Too Many Requests", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Teens make health happen", 120, 68, "429/Too Many Requests", 68, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Financials ", 120, 67, "429/Too Many Requests", 67, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Resources", 120, 42, "429/Too Many Requests", 42, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["living labs", 120, 49, "429/Too Many Requests", 49, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Program Plans", 120, 38, "429/Too Many Requests", 38, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Show Donate Now", 120, 21, "429/Too Many Requests", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HealthCorps Home page", 120, 3, "429/Too Many Requests", 3, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
