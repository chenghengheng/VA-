<script setup lang="ts">
import * as d3 from 'd3'

const svgWidth = ref(window.innerWidth * 0.09)
const svgHeight = ref(window.innerHeight * 0.5)


function drawChart() {
    const svg = d3.select(".l-container")
    svg.selectAll("*").remove()

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 20)
        .attr("r", 6)
        .style("fill", '#264653')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 25)
        .text("未知车辆")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 60)
        .attr("r", 6)
        .style("fill", '#287271')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 65)
        .text("小型车辆")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 100)
        .attr("r", 6)
        .style("fill", '#2a9d8f')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 105)
        .text("行人")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 140)
        .attr("r", 6)
        .style("fill", '#8ab17d')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 145)
        .text("非机动车")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 180)
        .attr("r", 6)
        .style("fill", '#e9c46a')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 185)
        .text("卡车")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 220)
        .attr("r", 6)
        .style("fill", '#efb366')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 225)
        .text("客车")

        svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 260)
        .attr("r", 6)
        .style("fill", '#f4a261')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 265)
        .text("静态物体")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 300)
        .attr("r", 6)
        .style("fill", '#e76f51')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 305)
        .text("手推车")

    svg.append("circle")
        .attr("cx", 10)
        .attr("cy", 340)
        .attr("r", 6)
        .style("fill", 'black')
    svg.append("circle")
        .attr("cx", 13)
        .attr("cy", 340)
        .attr("r", 6)
        .style("fill", 'black')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 345)
        .text("信号灯")

    svg.append("rect")
        .attr("x", 3)
        .attr("y", 380)
        .attr("width", 15)
        .attr("height", 3)
        .style("fill", 'red')
    svg.append("text")
        .attr("x", 30)
        .attr("y", 385)
        .text("停止线")

    svg.append("rect")
        .attr("x", 3)
        .attr("y", 420)
        .attr("width", 15)
        .attr("height", 5)
        .style("fill", 'white')
        .attr("stroke", 'green')

    svg.append("text")
        .attr("x", 30)
        .attr("y", 425)
        .text("人行线")
}

onMounted(() => {
  drawChart()
})

</script>

<template>
  <div class="p-1">
    <svg  :width="svgWidth" :height="svgHeight">
      <g class="l-container"></g>
    </svg>
    <div id="ltooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
  <!-- <el-button @click="toggleAnimation" class="ml-4" style="display: block; margin-bottom: 8px;">{{ isAnimating ? '暂停' : '播放' }}</el-button>
  <el-slider v-model="timeIndex" min="0" :max="150" :step="1" @change="updatePoints" class="ml-4 w-90%"/>
  <el-text class="mx-1" type="info">{{span}}</el-text>   
  <input type="range" min="0" :max="keys.length - 1" v-model="timeIndex" @input="updatePoints" /> -->
</template>
