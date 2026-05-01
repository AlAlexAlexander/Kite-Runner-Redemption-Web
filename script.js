const width = window.innerWidth;
const height = 700;

const CX = width / 2;
const CY = height / 2 + 60; // ⬅ theme moved slightly DOWN

/* -------------------------
   NODES
--------------------------*/
const nodes = [
  { id: "Redemption", group: "theme", fx: CX, fy: CY },

  { id: "Amir", group: "amir" },
  { id: "Hassan", group: "hassan" },
  { id: "Baba", group: "baba" },
  { id: "Rahim Khan", group: "rahim" },

  { id: "Q1", text: "For you, a thousand times over.", group: "quote" },
  { id: "Q2", text: "I ran.", group: "quote" },
  { id: "Q3", text: "There is a way to be good again.", group: "quote" },
  { id: "Q4", text: "I became what I am at twelve.", group: "quote" },
  { id: "Q5", text: "There is only one sin. And that is theft.", group: "quote" },
  { id: "Q6", text: "I watched Hassan get raped.", group: "quote" },
  { id: "Q7", text: "I was a coward.", group: "quote" },
  { id: "Q8", text: "I had to redeem myself.", group: "quote" }
];

/* -------------------------
   LINKS (UNCHANGED)
--------------------------*/
const links = [
  { source: "Redemption", target: "Amir" },
  { source: "Redemption", target: "Hassan" },
  { source: "Redemption", target: "Baba" },
  { source: "Redemption", target: "Rahim Khan" },

  { source: "Amir", target: "Q1" },
  { source: "Amir", target: "Q2" },
  { source: "Amir", target: "Q3" },
  { source: "Amir", target: "Q4" },
  { source: "Amir", target: "Q5" },
  { source: "Amir", target: "Q6" },
  { source: "Amir", target: "Q7" },
  { source: "Amir", target: "Q8" },

  { source: "Hassan", target: "Q1" },
  { source: "Hassan", target: "Q2" },
  { source: "Hassan", target: "Q6" },
  { source: "Hassan", target: "Q7" },

  { source: "Rahim Khan", target: "Q3" },
  { source: "Rahim Khan", target: "Q8" },

  { source: "Baba", target: "Q5" },
  { source: "Baba", target: "Q4" }
];

/* -------------------------
   COLORS (UNCHANGED)
--------------------------*/
const COLORS = {
  theme: "#FFD700",
  amir: "#1D4ED8",
  hassan: "#16A34A",
  baba: "#7C3AED",
  rahim: "#F97316",
  quote: "#DC2626"
};

/* -------------------------
   SVG
--------------------------*/
const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

/* -------------------------
   TITLE
--------------------------*/
svg.append("text")
  .attr("x", CX)
  .attr("y", 50)
  .attr("text-anchor", "middle")
  .style("fill", "white")
  .style("font-size", "28px")
  .style("font-weight", "bold")
  .style("pointer-events", "none")
  .text("The Kite Runner — Redemption Map");

/* -------------------------
   FORCE LAYOUT (CHARACTERS KEPT CLOSE)
--------------------------*/
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(165))
  .force("charge", d3.forceManyBody().strength(-680))
  .force("center", d3.forceCenter(CX, CY))
  .force("collision", d3.forceCollide(85))

  /* CHARACTER POSITIONS (tightened slightly) */
  .force("x", d3.forceX(d => {
    if (d.group === "theme") return CX;
    if (d.group === "quote") return CX + 650;
    return CX;
  }).strength(d => d.group === "quote" ? 0.05 : 0.28)) // ⬅ stronger pull for characters

  .force("y", d3.forceY(d => {
    if (d.group === "theme") return CY;

    // tighter vertical grouping around moved theme
    if (d.group === "amir") return CY - 200;
    if (d.group === "hassan") return CY - 200;
    if (d.group === "baba") return CY + 200;
    if (d.group === "rahim") return CY + 200;

    if (d.group === "quote") return CY + 450;
  }).strength(d => d.group === "quote" ? 0.05 : 0.28));

/* -------------------------
   LINKS
--------------------------*/
const link = svg.append("g")
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("stroke", d => COLORS[nodes.find(n => n.id === (d.source.id || d.source)).group])
  .attr("stroke-width", 2)
  .attr("opacity", 0.65);

/* -------------------------
   NODES
--------------------------*/
const node = svg.append("g")
  .selectAll("g")
  .data(nodes)
  .enter()
  .append("g")
  .call(
    d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
  );

function radius(d) {
  if (d.group === "theme") return 52;
  if (d.group === "quote") return Math.min(18 + d.text.length * 0.18, 72);
  return 32;
}

/* circles */
node.append("circle")
  .attr("r", radius)
  .attr("fill", d => COLORS[d.group])
  .attr("stroke", "#111")
  .attr("stroke-width", 3);

/* text */
node.append("text")
  .text(d => d.text ? d.text : d.id)
  .attr("text-anchor", "middle")
  .attr("dy", 4)
  .style("fill", "white")
  .style("stroke", "black")
  .style("stroke-width", "4px")
  .style("paint-order", "stroke")
  .style("font-size", d => d.group === "quote" ? "10px" : "13px")
  .style("font-weight", "600")
  .style("pointer-events", "none");

/* -------------------------
   HOVER
--------------------------*/
function highlight(id) {
  link.attr("opacity", d =>
    (d.source.id || d.source) === id || (d.target.id || d.target) === id ? 1 : 0.05
  );

  node.select("circle").attr("opacity", d =>
    d.id === id ? 1 : 0.2
  );
}

function reset() {
  link.attr("opacity", 0.65);
  node.select("circle").attr("opacity", 1);
}

node.on("mouseover", (e, d) => highlight(d.id));
node.on("mouseout", reset);

/* -------------------------
   SIMULATION
--------------------------*/
simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node.attr("transform", d => `translate(${d.x},${d.y})`);
});

/* -------------------------
   DRAG
--------------------------*/
function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  if (d.group !== "theme") {
    d.fx = d.x;
    d.fy = d.y;
  }
}

function dragged(event, d) {
  if (d.group !== "theme") {
    d.fx = event.x;
    d.fy = event.y;
  }
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  if (d.group !== "theme") {
    d.fx = null;
    d.fy = null;
  }
}
