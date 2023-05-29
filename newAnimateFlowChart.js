
var CSVMap = new Map();

var nodesID = new Map();

var edgesID = new Map();

var submitCount = 0;

var weights = {
    "s": 2,
    "m": 3,
    "h": 4,
    "D": 5,
    "M": 6,
    "A": 7
};

var svgPath = d3.select('body')
.select('svg')
.select('g')
.select('edge')
.select('g')
.select('a')

var svg2 = d3.select('body')
.select('svg')
.select('g')
.selectAll('.node');

svg2.each(function (p, j){

    let selection = d3.select(this).select("g");

    if(selection.empty() == false){
        let title = d3.select(this).select("g").select("a").attr("xlink:title");
        nodesID.set(title, this.id);
    }

});

var svg = d3.select('body')
    .select('svg')
    .select('g')
    .selectAll('.edge');

svg.each(function (p, j){

    let ID = d3.select(this).select('g').select("a").attr("xlink:title");
    let temp = this.id;

    let time = d3.select(this).selectAll('g');

    time.each(function(p, j) {

        if(this.id.includes('-',6) == true){
            let text = d3.select(this).select('a').select('text');

            if(text.attr('text-anchor') == 'middle'){
                let trimmedText = text.text().trim();

                // if(!weights.has(trimmedText[trimmedText.length-1])){
                //     weights.set(trimmedText[trimmedText.length-1], );
                // }

                edgesID.set(ID, [temp, trimmedText]);
                // console.log(trimmedText[trimmedText.length-1]);

            }
        }

    });
});

function readCSVFile(){

    var files = document.querySelector('#file').files;

    console.log(files);

    if(files.length > 0){

        var file = files[0];

        var reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function(event){

            var csvdata = event.target.result;

            var rowData = csvdata.split(';');

            loadCSV(rowData);
            console.log(CSVMap.size);

            let timeSpent = 500;

            for(let i = 1; i < CSVMap.size+1;i++){
                // console.log(CSVMap.get(i));
                if(CSVMap.get(i)[0].length == 1){
                    continue;
                }

                let path = d3.select('body')
                .select('svg')
                .select('g')
                .select('#' + edgesID.get(CSVMap.get(i)[0][0] + " -> " + CSVMap.get(i)[0][1])[0])
                .select('g')
                .select('a')
                .select('path');

                let beginning = path.node().getPointAtLength(0);

                let svg = d3.select('body').select('svg').select('g')
                .append('circle')
                .attr('id', 'circle' + i)
                .attr('cx', beginning.x)
                .attr('cy', beginning.y)
                .attr('r', '10')
                .attr('class', 'circle')
                .attr('stroke', 'none')
                .attr('fill', 'lightslategray')
                .attr('fill-opacity', '0.9');

                // console.log(CSVMap.get(i)[1]);
                timeSpent = (500 + 100*CSVMap.get(i)[1]);

                for(let j = 0; j < CSVMap.get(i)[0].length-1; j++){

                    let edge = d3.select('body')
                    .select('svg')
                    .select('g')
                    .select('#' + edgesID.get(CSVMap.get(i)[0][j] + " -> " + CSVMap.get(i)[0][j+1])[0])
                    .select('g')
                    .select('a')
                    .select('path');

                    let totalLength = edge.node().getTotalLength();
                    // Iniciar baseado no tempo do processo.

                    let time = edgesID.get(CSVMap.get(i)[0][j] + " -> " + CSVMap.get(i)[0][j+1])[1];
                    // console.log(time);
 
                    let unit = weights[time[time.length-1]];

                    let value = parseInt(time.slice(0,time.length-1));
                
                    let animationTime = value/(unit+value) + unit-1;

                    setTimeout(moveCircle.bind(this, totalLength, edgesID.get(CSVMap.get(i)[0][j] + " -> " + CSVMap.get(i)[0][j+1])[0], i, animationTime), timeSpent); 
                    // console.log(timeSpent);

                    timeSpent += animationTime*1000+500;

                }
                // console.log(timeSpent);

                id = setTimeout(deleteCircle.bind(this, 'circle' + i), (timeSpent+500)); 

            }
        }
    }
}

function loadCSV(rowData){

    let indexOfArray = 0;
    let valid = true;
    let count = 0;
    let caseReference = rowData[4].trim();
    let firstEnd = rowData[6];
    let currentEnd;
    let multiplier = 0;
    let granularity = document.querySelector('#number').value;
    submitCount++;
    console.log(granularity);

    if(submitCount > 1){
        restartCircles(id);
    }

    for(let i = 4; i < rowData.length; i += 4){
    
        
        let caseNumber = rowData[i].trim();
        
        if(nodesID.has(rowData[i+1])){ // Check if node is represented in fluxogram.
        
            if((caseReference == caseNumber) && (CSVMap.has(count))){
                
                if(valid){

                    if(edgesID.has(CSVMap.get(count)[0][indexOfArray] + " -> " + rowData[i+1])){

                        CSVMap.get(count)[0].push(rowData[i+1]);
                        indexOfArray += 1;

                    } else{
                        valid = false;
                    }
                }

            } else {

                currentEnd = rowData[i+2];
                // console.log(currentEnd);

                multiplier = timeElapsed(firstEnd, currentEnd, granularity);
                // console.log(multiplier);

                caseReference = caseNumber;
                count += 1;
                // CSVMap.set(count, [rowData[i+1]]);
                CSVMap.set(count, [[rowData[i+1]], multiplier]);
                indexOfArray = 0;
                valid = true;
            }
        }
    }
}

function timeElapsed(start, end, granularity){

    const firstEnd = new Date(start);
    const currentEnd = new Date(end);

    const duration = currentEnd.getTime() - firstEnd.getTime();

    return Math.floor(duration /(1000*60*60)/granularity);

}

function moveCircle(totalLength, edgeID, circleID, animationTime){

    const svgPath3 = d3.select('body')
        .select('svg')
        .select('g')
        .select('#' + edgeID)
        .select('g')
        .select('a')
        .select('path');
    
    const svg = d3.select('#circle' + circleID);

    // Create an object that gsap can animate
    const val = { distance: 0 };
    // Create a tween
    gsap.to(val, {
    // Animate from distance 0 to the total distance
    distance: totalLength,
    duration: animationTime,
    // Function call on each frame of the animation
    onUpdate: () => {

        // // Query a point at the new distance value
        const point = svgPath3.node().getPointAtLength(val.distance);

        svg.attr('cx', point.x).attr('cy', point.y);
    }
    });

}

function restartCircles(id){
    var delCircle = d3.selectAll('circle').remove();

    CSVMap = new Map();

    while(id--){
        window.clearTimeout(id);
    }


}

function deleteCircle(circleId){
    var del = d3.select('#'+circleId).remove();
}


/*

 */



