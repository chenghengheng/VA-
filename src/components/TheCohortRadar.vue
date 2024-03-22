<script setup lang="ts">
import * as d3 from 'd3'

const svgWidth = ref(window.innerWidth * 0.19)
const svgHeight = ref(window.innerHeight * 0.25)
const centerX = svgWidth.value / 2
const centerY = svgHeight.value / 2
const radius = Math.min(centerX, centerY) - 30

const svg = d3.select(".cr-container")

const dataset1 = [
  { name: "变道次数", value: 1.3101909078423293 },
  { name: "急变速次数", value: 0.22328663645103694 },
  { name: "直行平均速度", value: 1.1524886343935141 },
  { name: "转弯平均速度", value: 0.1454160421166907 }
] //0 green
const dataset2 = [
  { name: "变道次数", value: 17.8272398553636 },
  { name: "急变速次数", value: 0.743672157492969 },
  { name: "直行平均速度", value: 5.417756555804018 },
  { name: "转弯平均速度", value: 5.525873621541784 }
] //1 orange
const dataset3 = [
  { name: "变道次数", value: 5.422163135774938 },
  { name: "急变速次数", value: 0.8343768762329531 },
  { name: "直行平均速度", value: 6.061256906623347 },
  { name: "转弯平均速度", value: 0.11272755811344026 }
] //2 red

const maxValues = {
      "变道次数": 20,
      "急变速次数": 1,
      "直行平均速度": 10,
      "转弯平均速度": 10
    };

const numTicks = dataset1.length;

const angleScale = d3.scaleLinear()
        .domain([0, numTicks])
        .range([0, Math.PI * 2]);

const valueScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);

const line = d3.line()
    .x(function (d, i) { return centerX + valueScale(d.value) * Math.sin(angleScale(i)); })
    .y(function (d, i) { return centerY - valueScale(d.value) * Math.cos(angleScale(i)); })
    .curve(d3.curveLinearClosed);

function drawChart(dataset, index) {
    const svg = d3.select(".cr-container")

    const dataset_scale = dataset.map(d => ({
      name: d.name,
      value: (d.value / maxValues[d.name]) * 100
    }));

    svg.append("path")
        .datum(dataset_scale)
        .attr("fill", () => {
          if (index == 1) return "#849324"
          if (index == 2) return "#e36414"
          if (index == 3) return "#69306d"
        })
        .attr("fill-opacity", 0.1)
        .attr("stroke", () => {
          if (index == 1) return "#849324"
          if (index == 2) return "#e36414"
          if (index == 3) return "#69306d"
        })
        .attr("stroke-width", 2)
        .attr("d", line);

    const labels = svg.append("g")
      .attr("class", "labels");
    for (let i = 0; i < numTicks; i++) {
        let angle = angleScale(i);
        let r = radius + 10 * 0.5;
        let x = centerX + r * Math.sin(angle);
        let y = centerY - r * Math.cos(angle);
        labels.append("text")
            .attr("x", () => {
              if (i == 2) return x + 60
              if (i == 1) return x + 40
              if (i == 0) return x + 50
              else return x - 30
            })
            .attr("y", () => {
              if (i == 2) return y + 5
              if (i == 0) return y + 20
              else return y
            })
            .attr("text-anchor", "middle")
            .attr("fill", "#333333")
            .text(dataset[i].name)
    }  
}


onMounted(() => {
  const svg = d3.select(".cr-container")
  const hexagonGroup = svg.append("g").attr("class", "hexagon");

  const hexagon = hexagonGroup.append("polygon")
      .attr("points", () => {
          let points = "";
          for (let i = 0; i < numTicks; i++) {
              const angle = angleScale(i);
              const x = centerX + valueScale(100) * Math.sin(angle);
              const y = centerY - valueScale(100) * Math.cos(angle);
              points += `${x},${y} `;
          }
          return points;
      })
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("fill", '#faf8f8'); 

  for (let i = 0; i < numTicks; i++) {
      const angle = angleScale(i);
      const x = centerX + valueScale(100) * Math.sin(angle);
      const y = centerY - valueScale(100) * Math.cos(angle);
      
      hexagonGroup.append("line")
          .attr("x1", centerX)
          .attr("y1", centerY)
          .attr("x2", x)
          .attr("y2", y)
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .attr("class", `line-${i}`);
  }
  svg.append("circle")
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 5)
        .style("fill", '#849324')
        .on("mouseover", function (event) {
              const tooltip = d3.select("#rtooltip")
              tooltip.transition().duration(200)
                .style("opacity", 0.9)
              tooltip.html(`<strong>变道次数:</strong>1.31</br><strong>急变速次数:</strong>0.22</br><strong>直行平均速度:</strong>1.15</br><strong>转弯平均速度:</strong>0.15`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
            })
        .on("mouseout", function() {
          const tooltip = d3.select("#rtooltip")
          tooltip.transition().duration(200).style("opacity", 0)
        })
  svg.append("text")
        .attr("x", 30)
        .attr("y", 25)
        .text("保守型");
  svg.append("circle")
        .attr("cx", 20)
        .attr("cy", 50)
        .attr("r", 5)
        .style("fill", '#e36414')
        .on("mouseover", function (event) {
              const tooltip = d3.select("#rtooltip")
              tooltip.transition().duration(200)
                .style("opacity", 0.9)
              tooltip.html(`<strong>变道次数:</strong>17.83</br><strong>急变速次数:</strong>0.74</br><strong>直行平均速度:</strong>5.42</br><strong>转弯平均速度:</strong>5.53`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
            })
        .on("mouseout", function() {
          const tooltip = d3.select("#rtooltip")
          tooltip.transition().duration(200).style("opacity", 0)
        })
  svg.append("text")
        .attr("x", 30)
        .attr("y", 55)
        .text("活跃型");
  svg.append("circle")
        .attr("cx", 20)
        .attr("cy", 80)
        .attr("r", 5)
        .style("fill", '#69306d')
        .on("mouseover", function (event) {
              const tooltip = d3.select("#rtooltip")
              tooltip.transition().duration(200)
                .style("opacity", 0.9)
              tooltip.html(`<strong>变道次数:</strong>5.42</br><strong>急变速次数:</strong>0.83</br><strong>直行平均速度:</strong>6.06</br><strong>转弯平均速度:</strong>0.11`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
            })
        .on("mouseout", function() {
          const tooltip = d3.select("#rtooltip")
          tooltip.transition().duration(200).style("opacity", 0)
        })
  svg.append("text")
        .attr("x", 30)
        .attr("y", 85)
        .text("激进型");

  svg.append("text")
    .attr("x", svgWidth.value / 2 + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")  // 设置文本居中对齐
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("群体行为特征雷达图");

  var index = 1
  drawChart(dataset1, index)
  var index = 2
  drawChart(dataset2, index)
  var index = 3
  drawChart(dataset3, index)
})

</script>

<template>
  <div class="p-1">
    <svg  :width="svgWidth" :height="svgHeight">
      <g class="cr-container"></g>
    </svg>
    <div id="crtooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
