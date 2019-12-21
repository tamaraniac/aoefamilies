// read in data and call visualize
$(function() {
  d3.csv("FamilyTrees.csv").then(function(data) {
    visualize(data);
  })
})

var visualize = function(data) {
  // boilerplate setup
  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
     width = 960 - margin.left - margin.right,
     height = 1080 - margin.top - margin.bottom;

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
  var root = d3.tree(tree_data);

  
}
