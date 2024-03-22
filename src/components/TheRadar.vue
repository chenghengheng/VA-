<script setup lang="ts">
import * as d3 from 'd3'
import carData from '../assets/radar.json'
import useDataStore from '../stores/data'

const svgWidth = ref(window.innerWidth * 0.19)
const svgHeight = ref(window.innerHeight * 0.25)
const centerX = svgWidth.value / 2
const centerY = svgHeight.value / 2
const radius = Math.min(centerX, centerY) - 30

const store = useDataStore()
const id = computed(() => store.id)
const cluster = computed(() => store.cluster)

function isValidCarId(carId, carData) {
  return carData.some(d => d.car_id.toString() === carId);
}

function drawChart(carId, carData) {
    const svg = d3.select(".r-container")
    svg.selectAll("*").remove()

    const dataset = [
      { name: "变道次数", value: carData.lane_change },
      { name: "急加速次数", value: carData.high_acc_count },
      { name: "急减速次数", value: carData.low_acc_count },
      { name: "直行最大速度", value: carData.max_vel },
      { name: "直行平均速度", value: carData.mean_vel },
      { name: "转弯平均速度", value: carData.turning_speed }
    ];
    const maxValues = {
      "变道次数": 112,
      "急加速次数": 8,
      "急减速次数": 8,
      "直行最大速度": 29.106611,
      "直行平均速度": 29.106611,
      "转弯平均速度": 17.1307115
    };
    const dataset_scale = dataset.map(d => ({
      name: d.name,
      value: (d.value / maxValues[d.name]) * 100
    }));

    const numTicks = dataset.length;

    const angleScale = d3.scaleLinear()
        .domain([0, numTicks])
        .range([0, Math.PI * 2]);

    const valueScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, radius]);

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

    const line = d3.line()
        .x(function (d, i) { return centerX + valueScale(d.value) * Math.sin(angleScale(i)); })
        .y(function (d, i) { return centerY - valueScale(d.value) * Math.cos(angleScale(i)); })
        .curve(d3.curveLinearClosed);
    svg.append("path")
        .datum(dataset_scale)
        .attr("fill", () => {
          if (cluster.value == 0) return "#849324"
          if (cluster.value == 1) return "#e36414"
          if (cluster.value == 2) return "#69306d"
        })
        .attr("fill-opacity", 0.5)
        .attr("stroke", () => {
          if (cluster.value == 0) return "#849324"
          if (cluster.value == 1) return "#e36414"
          if (cluster.value == 2) return "#69306d"
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
              if (i == 3) return x + 70
              if (i == 0) return x + 60
              if (i == 1 || i == 2) return x + 50
              else return x - 50
            })
            .attr("y", () => {
              if (i == 0) return y + 15
              else return y
            })
            .attr("text-anchor", "middle")
            .attr("fill", "#333333")
            .text(dataset[i].name)
            .on("mouseover", function (event, d) {
              const tag = event.target.textContent
              const tooltip = d3.select("#rtooltip")
              tooltip.transition().duration(200)
                .style("opacity", 0.9)
              tooltip.html(`<strong>${tag}:</strong>${dataset.find(item => item.name === tag).value}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function() {
              const tooltip = d3.select("#rtooltip")
              tooltip.transition().duration(200).style("opacity", 0)
            })
    }
    
    svg.append("text")
        .attr("x", svgWidth.value / 2 + 10)
        .attr("y", 15)
        .attr("text-anchor", "middle")  // 设置文本居中对齐
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`个体行为特征雷达图`); 
    svg.append("text")
        .attr("x", 10)
        .attr("y", svgHeight.value - 20)
        .text(`id: ${id.value}`)
        .attr("fill", "gray");
}

watch(() => id.value, (newValue) => {
  const value = newValue.toString()
  if (isValidCarId(value, carData)) {
    const data = carData.filter(d => d.car_id.toString() === value);
    drawChart(value, data[0]);
  }
  else {
    alert("Invalid car id!");
  }
})

onMounted(() => {
  drawChart('206106583', carData.filter(d => d.car_id.toString() === '206106583')[0])
})

</script>

<template>
  <div class="p-1">
    <svg  :width="svgWidth" :height="svgHeight">
      <g class="r-container"></g>
    </svg>
    <div id="rtooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
