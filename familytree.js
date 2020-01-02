// read in data and call visualize
$(function() {
  d3.csv("FamilyTrees.csv").then(function(data) {
    visualize(data);
  })
});

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
  var highlightColor = "#36C6FF";

  // boilerplate setup
  var margin = { top: 30, right: 50, bottom: 30, left: 50 },
     width = 1080 - margin.left - margin.right,
     height = 700 - margin.top - margin.bottom;

  var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("width", width + margin.left + margin.right)
  .style("height", height + margin.top + margin.bottom);

  var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function update() {
    // update link color if it becomes highlighted
    g.selectAll(".link")
      .data(nodes.descendants().slice(1))
      .attr("stroke", function(d) {
        if (d.parent.family) {
          if (d.highlight) {
            return highlightColor;
          } else {
            return colors[founders.indexOf(d.parent.family) % colors.length];
          }
        }
      });

    // update node color if it becomes highlighted
    g.selectAll(".node")
      .data(nodes.descendants())
      .style("fill", function(d) {
        if (d.found) {
          return highlightColor;
        } else {
          return colors[founders.indexOf(d.family) % colors.length];
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

    // map data to nodes (which are shifted up to hide founder node) & display nodes, shifted up to hide founder node (which is rendered clear to hide it)
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
      })
      .append("circle")
      .attr("r", 4)
      .style("opacity", function(d) {
        if (!d.family) {
          return 0;
        }
      })
      .style("fill", function(d) {
        return colors[founders.indexOf(d.family) % colors.length];
      });

    // add tooltip to nodes
    node.on("mouseover", tip.show)
      .on("mouseout", tip.hide);
  };

  // create hierachy structure from data
  var tree_data = d3.stratify()
    .id(function(d) { return d.Little; })
    .parentId(function(d) { return d.Big; })
    (data);

  // create tree layout
  var treemap = d3.tree().size([width, height]);
  var nodes = d3.hierarchy(tree_data);
  nodes = treemap(nodes);

  // recursively find node given an id
  var findNode = function(node, id) {
    if (node.data.id == id) {
      return node;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        let res = findNode(node.children[i], id);
        if (res) {
          return res;
        }
      }
    }

    return false;
  };

  // get data without founder node
  var treeElements = nodes.descendants();
  treeElements.shift();

  // get ids of data
  var searchData = [];
  for (let i = 0; i < treeElements.length; i++) {
    searchData.push(treeElements[i].data.id);
  }

  var colorPath = function(path) {
    // find all already highlighted and unhighlight
    var currHighlighted = nodes.descendants().filter(d => d.highlight);
    for (let i = 0; i < currHighlighted.length; i++) {
      currHighlighted[i].highlight = false;
    }

    // highlight new path
    for (let i = 0; i < path.length; i++) {
      path[i].highlight = true;
    }

    update();
  };

  // initialize search box
  $("#search").select2({
    data: searchData,
    containerCssClass: "search"
  });

  // attach search box listener
  $("#search").on("select2:select", function(e) {
    // find node with name
    let n = findNode(nodes, e.params.data.text);
		if (n) {
      n.found = true;
      var path = nodes.path(n);
      path.shift();
			colorPath(path);
		}
		else {
			alert(e.params.data.text + " not found!");
		}
	});

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
  };

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

  update();
}
