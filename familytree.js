// read in data and call visualize
$(function() {
  d3.csv("FamilyTrees.csv").then(function(data) {
    visualize(data);
  })
})

var visualize = function(data) {
  // color pallete
  var colors = [
    "#55DDE0",
    "#33658A",
    "#2F4858",
    "#F6AE2D",
    "#F26419",
    "#746F72",
    "#007EA7"
  ];

  // boilerplate setup
  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
     width = 1080 - margin.left - margin.right,
     height = 960 - margin.top - margin.bottom;

  var svg = d3.select('#chart')
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("width", width + margin.left + margin.right)
  .style("height", height + margin.top + margin.bottom);

  var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create hierachy structure from data
  var tree_data = d3.stratify()
    .id(function(d) { return d.Little; })
    .parentId(function(d) { return d.Big; })
    (data);

  // create tree layout
  var treemap = d3.tree().size([width, height]);
  var nodes = d3.hierarchy(tree_data);
  nodes = treemap(nodes);

  // debug
  console.log(nodes);

  // map data to nodes
  var node = g.selectAll(".node")
    .data(nodes.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

  // map data to links and display links
  // TODO: fix d function
  var link = g.selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter().append("path")
    .attr("class", "link")
    .style("stroke", "black")
    .attr("d", d => {
      return "M" + d.x + "," + d.y
        + "C" + (d.x + d.parent.x) / 2 + "," + d.y
        + " " + (d.x + d.parent.x) / 2 + "," + d.parent.y
        + " " + d.parent.x + "," + d.parent.y;
    });

  // display nodes
  node.append("circle")
    .attr("r", 4)
    .style("fill", "black");

  // TODO: hide root note
  // TODO: add colors depending on subroot
  // TODO: add hover with name
  // TODO: add label above each family
}
