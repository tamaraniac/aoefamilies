// read in data and call visualize
$(function() {
  d3.csv("FamilyTrees.csv").then(function(data) {
    visualize(data);
  })
})

var visualize = function(data) {
  // color pallete
  var colors = [
    "#33658A",
    "#2F4858",
    "#F6AE2D",
    "#F26419",
    "#746F72",
    "#007EA7"
  ];

  // boilerplate setup
  var margin = { top: 30, right: 50, bottom: 30, left: 50 },
     width = 1080 - margin.left - margin.right,
     height = 700 - margin.top - margin.bottom;

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

  // function to recursively add family attribute to all decendant nodes
  var addFamily = function(node, fam) {
    // add family attribute to current node
    node.family = fam;

    // iterate through node's children & call recursively
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        addFamily(node.children[i], fam);
      }
    }
  }

  // get array of family root nodes & give all nodes a family attribute
  var founders = [];
  for (let i = 0; i < nodes.children.length; i++) {
    founders.push(nodes.children[i].data.id);
    addFamily(nodes.children[i], nodes.children[i].data.id);
  }

  // create tooltip
  var tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      if (d.family) {
        return "<div>" + d.data.id + "</div>";
      } else {
        return "";
      }
    })
    .style("opacity", function(d) {
      if (!d.family) {
        return 0;
      }
    });
  g.call(tip);

  // find y distance between "founder node" and its children
  if (nodes.children) {
    var diff = nodes.children[0].y - nodes.y;
  } else {
    var diff = 0;
  }

  // map data to nodes (which are shifted up to hide founder node)
  var node = g.selectAll(".node")
    .data(nodes.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      if (d.family) {
        return "translate(" + d.x + "," + (d.y - diff) + ")";
      } else {
        return "translate(" + d.x + "," + d.y + ")";
      }
    });

  // map data to links & display links
  var link = g.selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter().append("line")
    .attr("class", "link")
    .attr('x1', function(d) {
      return d.parent.x;
    })
    .attr('y1', function(d) {
      return (d.parent.y - diff);
    })
    .attr('x2', function(d) {
      return d.x;
    })
    .attr('y2', function(d) {
      return (d.y - diff);
    })
    .attr("stroke", function(d) {
      if (d.parent.family) {
        return colors[founders.indexOf(d.parent.family) % colors.length];
      }
    });

  // display nodes, shifted up to hide founder node (which is rendered clear to hide it)
  node.append("circle")
    .attr("r", 4)
    .style("fill", function(d) {
      if (d.family) {
        return colors[founders.indexOf(d.family) % colors.length];
      }
    })
    .style("opacity", function(d) {
      if (!d.family) {
        return 0;
      }
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // TODO: add label above each family
}
