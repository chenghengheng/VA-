<script setup lang="ts">
import * as d3 from 'd3'
import data from '../assets/sampled_data.json'
import useDataStore from '../stores/data'

const svgWidth = ref(window.innerWidth * 0.39)
const svgHeight = ref(window.innerHeight * 0.25)
const store = useDataStore()

function drawChart() {
    const svg = d3.select(".cc-container")
    svg.selectAll("*").remove()

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.x }))
        .range([svgWidth.value * 0.01, svgWidth.value * 0.96]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.y }))
        .range([svgHeight.value * 0.9, svgHeight.value * 0.05]);

    svg.append("g")
        .attr("transform", `translate(0, ${svgHeight.value * 0.9})`)
        .call(d3.axisBottom(xScale).tickFormat(''));

    svg.append("g")
        .attr("transform", `translate(${svgWidth.value * 0.01}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(''));

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 3) 
        .attr('fill', d => ['#849324', '#e36414', '#69306d'][d.cluster])
        .on("click", function (event, d) {
            store.updateRadarId(event.target.__data__.car_id)
            store.updateRadarCluster(event.target.__data__.cluster)
        })

    svg.append("circle")
            .attr("cx", 820)
            .attr("cy", 20)
            .attr("r", 5)
            .style("fill", '#849324')
    svg.append("text")
            .attr("x", 830)
            .attr("y", 25)
            .text("保守型");
    svg.append("circle")
            .attr("cx", 820)
            .attr("cy", 50)
            .attr("r", 5)
            .style("fill", '#e36414')
    svg.append("text")
            .attr("x", 830)
            .attr("y", 55)
            .text("活跃型");
    svg.append("circle")
            .attr("cx", 820)
            .attr("cy", 80)
            .attr("r", 5)
            .style("fill", '#69306d')
    svg.append("text")
            .attr("x", 830)
            .attr("y", 85)
            .text("激进型");
    // 添加标题
    svg.append("text")
    .attr("x", svgWidth.value / 2 + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")  // 设置文本居中对齐
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("群体行为特征散点图");
}

onMounted(() => {
  drawChart()
})

</script>

<template>
  <div class="p-1">
    <svg  :width="svgWidth" :height="svgHeight">
      <g class="cc-container"></g>
    </svg>
    <div id="cctooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
