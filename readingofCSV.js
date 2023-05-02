
var CSVMap = new Map();

var nodesID = new Map();

var edgesID = new Map();

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
                edgesID.set(ID, [temp, trimmedText]);
            }
        }

    });

});

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

            for(let i = 1; i < CSVMap.size+1;i++){

                if(CSVMap.get(i).length == 1){
                    continue;
                }

                var path = d3.select('body')
                .select('svg')
                .select('g')
                .select('#' + edgesID.get(CSVMap.get(i)[0] + " -> " + CSVMap.get(i)[1])[0])
                .select('g')
                .select('a')
                .select('path');

                const beginning = path.node().getPointAtLength(0);

                var svg = d3.select('body').select('svg').select('g')
                .append('circle')
                .attr('id', 'circle' + i)
                .attr('cx', beginning.x)
                .attr('cy', beginning.y)
                .attr('r', '8')
                .attr('class', 'circle')
                .attr('stroke', 'none')
                .attr('fill', 'lightslategray')
                .attr('fill-opacity', '0.9');

                for(let j = 0; j < CSVMap.get(i).length-1; j++){

                    path = d3.select('body')
                    .select('svg')
                    .select('g')
                    .select('#' + edgesID.get(CSVMap.get(i)[j] + " -> " + CSVMap.get(i)[j+1])[0])
                    .select('g')
                    .select('a')
                    .select('path');

                    const totalLength = path.node().getTotalLength();

                    setTimeout(moveCircle.bind(this, totalLength, edgesID.get(CSVMap.get(i)[j] + " -> " + CSVMap.get(i)[j+1])[0], i), 2500*j);

                }

            }

        }
    }
}

function loadCSV(rowData){

    var indexOfArray = 0;
    var valid = true;
    var count = 0;
    let caseReference = rowData[4].trim();

    restartCircles();

    for(var i = 4; i < rowData.length; i += 4){
    
        
        let caseNumber = rowData[i].trim();

        if(nodesID.has(rowData[i+1])){ // Check if node is represented in fluxogram.
        
            if((caseReference == caseNumber) && (CSVMap.has(count))){
                
                if(valid){

                    if(edgesID.has(CSVMap.get(count)[indexOfArray] + " -> " + rowData[i+1])){

                        CSVMap.get(count).push(rowData[i+1]);
                        indexOfArray += 1;

                    } else{
                        valid = false;
                    }
                }

            } else {
                caseReference = caseNumber;
                count += 1;
                CSVMap.set(count, [rowData[i+1]]);
                indexOfArray = 0;
                valid = true;
            }
        }
    }
}

function moveCircle(totalLength, edgeID, circleID){

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
    duration: 2,
    // Function call on each frame of the animation
    onUpdate: () => {

        // // Query a point at the new distance value
        const point = svgPath3.node().getPointAtLength(val.distance);

        svg.attr('cx', point.x).attr('cy', point.y);
    }
    });

}

function restartCircles(){
    var delCircle = d3.selectAll('circle').remove();
}

