d3.select('body')
    .select('svg')
    .select('g')
    .select('polygon')
    .style('fill', 'gainsboro');

var toFreq = new Map();

var nodeID = new Map();

function readCSVFile(){

    var files = document.querySelector('#file').files;

    if(files.length > 0){

        var file = files[0];

        var reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function(event){

            var csvdata = event.target.result;

            var rowData = csvdata.split(';');

            loadCSVData(rowData);

            loadHashMap();

            for(var i = 0; i < toFreq.size; i++){ // For loop to access different timespans (0-12 hours, etc.)

                if(toFreq.get(i) != null){ // Handling edge cases

                    for(var j = 0; j < toFreq.get(i).length; j++){ // Get different Activities to blink during this timespan

                        for(var z = 0; z < toFreq.get(i)[j][1]; z++){ // Get frequency number by activity

                            setTimeout(makeColor.bind(this, nodeID.get(toFreq.get(i)[j][0])), (2000/toFreq.get(i)[j][1] + 1000*i + 2000 + 2000/toFreq.get(i)[j][1]*z));
                            setTimeout(makeBlack.bind(this, nodeID.get(toFreq.get(i)[j][0])), (2000/toFreq.get(i)[j][1] + 1000*i + 2000 + 2000/toFreq.get(i)[j][1]*z + 2000/toFreq.get(i)[j][1]/2));

                        }
                    } 
                }
            }
        }
    }
}

function makeColor(nodeID){

    var svg = d3.select('body')
    .select('svg')
    .select('g')
    .select('#' + nodeID)
    .style('stroke-width', 4)
    .select('polygon')
    .style('stroke', 'yellow');
    
}

function makeBlack(nodeID){

    var svg = d3.select('body')
    .select('svg')
    .select('g')
    .select('#' + nodeID)
    .style('stroke-width', 1)
    .select('polygon')
    .style('stroke', 'black');

}

function timeElapsed(start, end){

    const firstEnd = new Date(start);
    const currentEnd = new Date(end);

    const duration = currentEnd.getTime() - firstEnd.getTime();

    if(duration / (1000 * 60 * 60) <= 12){
        return 0;
    }

    return 1;
}

function loadCSVData(rowData){
    var firstEnd = rowData[7];
    var indexOfArray = 0;

    for(var i = 5; i < rowData.length; i += 4){
        if(timeElapsed(firstEnd, rowData[i+2]) == 0){
            if(toFreq.has(indexOfArray)){

                var check = false;
                var index;

                for(var j = 0; j < toFreq.get(indexOfArray).length; j++){
                    if(toFreq.get(indexOfArray)[j].includes(rowData[i])){
                        check = true;
                        index = j;
                        break;
                    } 
                }
                if(!check){
                    toFreq.get(indexOfArray).push([rowData[i], 1]);
                } else{
                    toFreq.get(indexOfArray)[index][1] += 1;
                }
                
            } else {
                toFreq.set(indexOfArray, [[rowData[i], 1]]);
            }
        } else{
            firstEnd = rowData[i+2];
            indexOfArray++;
        }
    }
}

function loadHashMap(){
    var svg2 = d3.select('body')
    .select('svg')
    .select('g')
    .selectAll('.node');

    svg2.each(function (p, j){

        var text = (d3.select(this)).select('text');

        if(text.attr('text-anchor') == 'middle'){
            nodeID.set(text.text().substring(0, text.text().indexOf(" ")), this.id);
        }
    });
}
