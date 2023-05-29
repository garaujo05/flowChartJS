var CSVMap = new Map();

var nodesID = new Map();

var edgesID = new Map();

var myAnimation = new Array();

var submitCount = 0;

var paused = true;

var weights = {
    "s": 2,
    "m": 3,
    "h": 4,
    "D": 5,
    "M": 6,
    "A": 7
};

function readCSVFile(){

    var files = document.querySelector('#file').files;

    if(files.length > 0){

        var file = files[0];

        var reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function(event){

            var csvdata = event.target.result;

            var rowData = csvdata.split(';');

            loadCSV(rowData);

            var circles = new Array(CSVMap.size);
            
            for(let i = 1; i < CSVMap.size+1;i++){

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

                circles[i-1] = new Circle(i, CSVMap.get(i)[1]/10);

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

                    let unit = weights[time[time.length-1]];

                    let value = parseInt(time.slice(0,time.length-1));
                
                    let animationTime = value/(unit+value) + unit-1;

                    circles[i-1].incrementNodes(CSVMap.get(i)[0][j], CSVMap.get(i)[0][j+1]);
                    circles[i-1].incrementTotalLength(totalLength);
                    circles[i-1].incrementAnimationTime(animationTime);
                    circles[i-1].setFinal(!(j < CSVMap.get(i)[0].length-2));

                }

                moveCircle(circles[i-1].totalLength[0], circles[i-1].startNodes[0], circles[i-1].endNodes[0], circles[i-1].reference, circles[i-1].animationTime[0],circles[i-1].final[0], 1, circles, i-1, circles[i-1].delay);

            }
        }
    }
}

function moveCircle(totalLength, startNode, endNode, circleID, animationTime, final, index, circles, start, delay){

    let svgPath3 = d3.select('body')
        .select('svg')
        .select('g')
        .select('#' + edgesID.get(startNode + ' -> ' + endNode)[0])
        .select('g')
        .select('a')
        .select('path');
    
    let svg = d3.select('#circle' + circleID);
    
    // Create an object that gsap can animate
    let val = { distance: 0 };
    // Create a tween
    let tempAnimation = gsap.to(val, {
    // Animate from distance 0 to the total distance
    distance: totalLength,
    duration: animationTime,
    paused: paused,
    delay: delay,

    // Function call on each frame of the animation
    onUpdate: () => {

        // Query a point at the new distance value
        let point = svgPath3.node().getPointAtLength(val.distance);

        svg.attr('cx', point.x).attr('cy', point.y);

    },

    onComplete: () => {

        incrementOpacity(endNode);

        if(final){
            deleteCircle('circle' + circleID);
        } else{
            // Vai pro próximo círculo
            moveCircle(circles[start].totalLength[index], circles[start].startNodes[index], circles[start].endNodes[index], circles[start].reference, circles[start].animationTime[index], circles[start].final[index], index+1, circles, start, 1);
        }
    }

    });

    myAnimation.push(tempAnimation);

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

    if(submitCount > 1){
        restartCircles();
    } else{
        loadEdgesID();
        loadNodesID();
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

                multiplier = timeElapsed(firstEnd, currentEnd, granularity);

                caseReference = caseNumber;
                count += 1;
                CSVMap.set(count, [[rowData[i+1]], multiplier]);
                indexOfArray = 0;
                valid = true;
            }
        }
    }
}

function loadNodesID(){

    var svg2 = d3.select('body')
    .select('svg')
    .select('g')
    .selectAll('.node');

    svg2.each(function (p, j){

        let selection = d3.select(this).select("g");

        if(selection.empty() == false){
            let title = d3.select(this).select("g").select("a").attr("xlink:title");
            nodesID.set(title, [this.id, 0]);
        }

    });

}

function loadEdgesID(){
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

                    edgesID.set(ID, [temp, trimmedText]);
                }
            }

        });
    });
}

function incrementOpacity(endNode){

    if(nodesID.get(endNode)[1] == 0){

        d3.select('#'+nodesID.get(endNode)[0])
        .select('a')
        .select('path')
        .attr('fill', 'rgb(120,172,255)')
        .attr('fill-opacity', '1%');

    } else if(nodesID.get(endNode)[1] < 100){

        d3.select('#'+nodesID.get(endNode)[0])
        .select('a')
        .select('path')
        .attr('fill-opacity', nodesID.get(endNode)[1]+0.01 + '%');
    }

    nodesID.get(endNode)[1] += 1;

}

function restartOpacity(){
    var svg = d3.select('body')
    .select('svg')
    .select('g')
    .selectAll('.node');

    svg.each(function (p, j){

        let selection = d3.select(this).select("g");

        if(selection.empty() == false){
            d3.select(this).select("g").select("a").select('path').attr('fill', '#ffffff').attr('fill-opacity', '100%');
        }

    });
}

function restartCircles(){
    var delCircle = d3.selectAll('circle').remove();

    for(let i = 0; i < myAnimation.length; i++){
        myAnimation[i].kill();
        myAnimation[i] = null;
    }

    CSVMap = new Map();
    myAnimation = new Array();
    restartOpacity();

    nodesID.forEach((value) => {
        // console.log(value[1]);
        value[1] = 0;

    });

}

function deleteCircle(circleId){
    var del = d3.select('#'+circleId).remove();
}

function pause(){
    paused = true;

    for(let i = 0; i < myAnimation.length; i++){
        myAnimation[i].paused(true);
    }
}

function unpause(){
    if(paused){
        for(let i = 0; i < myAnimation.length; i++){
            myAnimation[i].paused(false);
        }
        paused = false;
    }
}

function timeElapsed(start, end, granularity){

    const firstEnd = new Date(start);
    const currentEnd = new Date(end);

    const duration = currentEnd.getTime() - firstEnd.getTime();

    if(granularity <= 0){
        granularity = 1;
    }

    return Math.floor(duration /(1000*60*60)/granularity);

}

class Circle{
    constructor(i=0, delay){
        this.totalLength = [];
        this.startNodes = [];
        this.endNodes = [];
        this.reference = i;
        this.animationTime = [];
        this.final = [];
        this.delay = delay;
    }

    incrementNodes(startNode, endNode){
        this.startNodes.push(startNode);
        this.endNodes.push(endNode);
    }

    incrementTotalLength(totalLength){
        this.totalLength.push(totalLength);
    }

    incrementAnimationTime(animationTime){
        this.animationTime.push(animationTime);
    }

    setFinal(final){
        this.final.push(final);
    }

}