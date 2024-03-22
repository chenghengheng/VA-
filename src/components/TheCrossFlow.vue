<script setup lang="ts">
import * as d3 from 'd3'
import data from '../assets/position_num_dic.json'
import useDataStore from '../stores/data'

const store = useDataStore()
const svgWidth = ref(window.innerWidth * 0.29)
const svgHeight = ref(window.innerHeight * 0.21)
const j = ref(0)

const formatTooltip = (val: number) => {
  if (val === 0) return '7:00';
  const hours = Math.floor(val / 2) + 7;
  const minutes = val % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
};

function drawChart() {
    const svg = d3.select(".crf-container")
    svg.selectAll("*").remove()

    const hScale = d3.scaleLinear()
            .domain([0, 6500])
            .range([svgHeight.value * 0.89, svgHeight.value * 0.05]);

    const dScale = d3.scaleLinear()
            .domain([-1, 8])
            .range([svgWidth.value * 0.08, svgWidth.value * 0.96]);

    // const colors = ['#797d62', '#9b9b7a', '#d9ae94', '#e5c59e', '#f8d488', '#e4b074', '#d08c60', '#997b66'];
    
    svg.append("g")
        .attr("transform", `translate(${svgWidth.value * 0.08}, 0)`)
        .call(d3.axisLeft(hScale));

    svg.append("g")
        .attr("transform", `translate(0, ${svgHeight.value * 0.89})`)
        .call(d3.axisBottom(dScale).tickValues(d3.range(0, 8)).tickFormat(function (d, k) {
            return `路口${k + 1}`;
        }));

    svg.selectAll(".histogram")
        .data(data[j.value])
        .enter()
        .append("rect")
        .attr("class", "histogram")
        .attr("x", function (d, i) { return dScale(i) - 20; })  // 每个柱子的横坐标位置
        .attr("y", function (d) { return hScale(d); })  // 每个柱子的纵坐标位置
        .attr("width", 40)  // 每个柱子的宽度
        .attr("height", function (d) { return hScale(0) - hScale(d); })  // 每个柱子的高度
        .attr("fill", function (d, i) { return '#8ecae6'; })
        .on("click", function (d, i) {
            store.updateCrossNumber(data[j.value].indexOf(i) + 1)
        })
    
    svg.selectAll(".histogram-text")
        .data(data[j.value])
        .enter()
        .append("text")
        .attr("class", "histogram-text")
        .attr("x", function (d, i) {
            if (d > 99999) return dScale(i) - 20 + 1;
            else return dScale(i) - 15 ;
        })
        .attr("y", function (d) { return hScale(d) - 5; })
        .text(d => d)
        .style("font-size", "12px");
    
}

onMounted(() => {
    drawChart()
})

watch(() => j.value, (newValue) => {
    store.updateCrossTime(newValue)
    drawChart()
})

</script>

<template>
  <div class="p-1">
    <div class="flex items-center">
        <el-slider v-model="j" :min="0" :max="17" :step="1" class="ml-4 w-25%" :format-tooltip="formatTooltip"/>
        <strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;路口车流量统计({{ formatTooltip(j) }}-{{ formatTooltip(j+1) }})</strong>
    </div>
    <svg ref="Plot" :width="svgWidth" :height="svgHeight">
      <g class="crf-container"></g>
    </svg>
    <div id="crftooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
