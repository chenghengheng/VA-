<script setup lang="ts">
import * as d3 from 'd3'
import data from '../assets/data1.json'

const svgWidth = ref(window.innerWidth * 0.38)
const svgHeight = ref(window.innerHeight * 0.5)

function timestampToDateTime(timestamp) {
  // 将毫秒级时间戳转换为日期-时间形式
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`
  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return `${formattedDate} ${formattedTime}`
}

function drawChart() {
    const svg = d3.select(".chart-container")

    // 时间比例尺（X 轴）
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return new Date(d.timestamp) }))
        .range([svgWidth.value * 0.1, svgWidth.value * 0.98])

    // 序数比例尺（Y 轴）
    const yScale = d3.scaleBand()
        .domain(data.map(function(d) { return '道路'+d.road + '' + d.方向+'向' }))
        .range([svgHeight.value * 0.1, svgHeight.value * 0.93])
        .padding(0.1)

    // 创建 X 轴
    const xAxis = d3.axisBottom(xScale)
    svg.append('g')
        .attr('transform', 'translate(0,' +  svgHeight.value * 0.93 + ')')
        .call(xAxis)

    // 创建 Y 轴
    const yAxis = d3.axisLeft(yScale)
    svg.append('g')
        .attr('transform', `translate(${svgWidth.value * 0.1},0)`)
        .call(yAxis)

    // 根据 count 返回对应的半径大小
    const radiusScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +d.count }))
        .range([3, 8]) // 需要调整

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([d3.min(data, d => +d.velocity), d3.max(data, d => +d.velocity)])

    // console.log(d3.extent(data, function(d) { return +d.velocity }))
    // console.log(d3.extent(data, function(d) { return +d.count }))

    // 添加渐变图例
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(10, 10)")
    const defs = svg.append("defs")

    // 定义渐变
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
    linearGradient.selectAll("stop")
        .data(d3.ticks(0, d3.max(data, d => +d.velocity), 10))
        .enter().append("stop")
        .attr("offset", d => d/12)
        .attr("stop-color", d => colorScale(d))

    //添加渐变矩形
    legend.append("rect")
        .attr("width", 200)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)")

    // 添加图例标签
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.velocity))
        .range([0, 200])
    const legendAxis = d3.axisBottom(x)
        .ticks(6)
    legend.append("g")
        .attr("class", "legend-axis")
        .call(legendAxis)
    legend.append("text")
        .attr("x", 205)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text('速度m/s')

    const circles = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function(d) { return xScale(new Date(d.timestamp)) })
      .attr('cy', function(d) { return yScale('道路'+d.road + ''  + d.方向+'向') + 5 }) // 需要调整
      .attr('r', function(d) { return radiusScale(+d.count) })
      .attr('fill', function(d) { return colorScale(+d.velocity) })
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("#tooltip")
        tooltip.transition().duration(200)
          .style("opacity", 0.9)
        tooltip.html(`道路${d.road + '' + d.方向}向<br/><strong>时间:</strong> ${timestampToDateTime(d.timestamp)}<br/><strong>流量:</strong> ${d.count}<br/><strong>速度:</strong> ${d.velocity}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", function() {
        const tooltip = d3.select("#tooltip")
        tooltip.transition().duration(500).style("opacity", 0)
      })
    }

onMounted(() => {
  drawChart()
})

</script>

<template>
  <div class="p-2">
    <svg ref="Plot" :width="svgWidth" :height="svgHeight">
      <g class="chart-container"></g>
    </svg>
    <div id="tooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
