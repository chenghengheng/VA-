<script setup lang="ts">
import * as d3 from 'd3'
import useDataStore from '../stores/data'

const svgWidth = ref(window.innerWidth * 0.29)
const svgHeight = ref(window.innerHeight * 0.25)
const myDict = {
  "-1": "未知车辆",
  "1": "小型车辆",
  "2": "行人",
  "3": "非机动车",
  "4": "卡车",
  "6": "客车",
  "7": "静态物体",
  "10": "手推车"
};

const store = useDataStore()
const cut_number = computed(() => store.cut_number)
const cut_ori = computed(() => store.cut_ori)

function drawChart() {
    const svg = d3.select(".ct-container")
    svg.selectAll("*").remove()
    
    d3.csv("df1.csv").then(function(data) {
      const subgroups = data.columns.slice(1)
      const groups = data.map(d => d.group)

      const xScale = d3.scaleLinear()
        .domain([0, 19])
        .range([svgWidth.value * 0.08, svgWidth.value * 0.96]);

      const yScale = d3.scaleLinear()
        .domain([0, 27000])
        .range([svgHeight.value * 0.89, svgHeight.value * 0.05]);

      // 创建 X 轴
      svg.append('g')
          .attr('transform', `translate(0, ${svgHeight.value * 0.89})`)
          .call(d3.axisBottom(xScale).tickValues(d3.range(1, 19)).tickFormat(function (d) {
              // 自定义刻度值的显示方式
              const hours = (7 + Math.floor((d - 1) / 2)).toString();
              if (d % 2 == 0) { var minutes = "30"; }
              else { var minutes = "00"; }
              return `${hours}:${minutes}`;
          }));

      // 创建 Y 轴
      const yAxis = d3.axisLeft(yScale)
      svg.append('g')
          .attr('transform', `translate(${svgWidth.value * 0.08}, 0)`)
          .call(yAxis)

      // color palette = one color per subgroup
      const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#264653', '#287271', '#2a9d8f', '#8ab17d', '#e9c46a', '#efb366', '#f4a261', '#e76f51']);


      const stackedData = d3.stack()
        .keys(subgroups)
        (data)
      
      svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
          .attr("fill", d => color(d.key))
          .attr("class", d => "myRect key-" + d.key )
          .selectAll("rect")
          .data(d => d)
          .join("rect")
            .attr("x", d => xScale(d.data.group) - 10)
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width",10)
            .attr("stroke", "grey")
            .attr("opacity", d => {
              if (cut_number.value + 1 == d.data.group && cut_ori.value == 0) return 1
              if (cut_number.value == 18) return 1
              else return 0.2
            })
            .on("mouseover", function (event,d) { 
              const subGroupName = d3.select(this.parentNode).datum().key
              d3.selectAll(".myRect").style("opacity", 0.2)
              d3.selectAll(".key-"+subGroupName).style("opacity",1)
              const tooltip = d3.select("#cttooltip")
              tooltip.transition().duration(200)
                  .style("opacity", 0.9)
              tooltip.html(`<strong>类型：</strong>${myDict[subGroupName]}<br/><strong>流量：</strong>${d.data[subGroupName]}`)
                  .style("left", (event.pageX - 5) + "px")    
                  .style("top", (event.pageY + 28) + "px")
            })
            .on("mouseleave", function (event,d) {
              d3.selectAll(".myRect").style("opacity",1)
              const tooltip = d3.select("#cttooltip")
              tooltip.transition().duration(10).style("opacity", 0)
            })

      svg.append("text")
        .attr("x", xScale(18) - 40)
        .attr("y", yScale(26000))
        .text("左：东西向");

      svg.append("text")
          .attr("x", xScale(18) - 40)
          .attr("y", yScale(26000) + 20)
          .text("右：南北向");
    })

    d3.csv("df2.csv").then(function(data) {
      const subgroups = data.columns.slice(1)
      const groups = data.map(d => d.group)

      const xScale = d3.scaleLinear()
        .domain([0, 19])
        .range([svgWidth.value * 0.08, svgWidth.value * 0.96]);

      const yScale = d3.scaleLinear()
        .domain([0, 27000])
        .range([svgHeight.value * 0.89, svgHeight.value * 0.05]);

      // color palette = one color per subgroup
      const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#264653', '#287271', '#2a9d8f', '#8ab17d', '#e9c46a', '#efb366', '#f4a261', '#e76f51']);

      //stack the data? --> stack per subgroup
      const stackedData = d3.stack()
        .keys(subgroups)
        (data)
      
      svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
          .attr("fill", d => color(d.key))
          .attr("class", d => "myRect key-" + d.key )
          .selectAll("rect")
          .data(d => d)
          .join("rect")
            .attr("x", d => xScale(d.data.group))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width",10)
            .attr("stroke", "grey")
            .attr("opacity", d => {
              if (cut_number.value + 1 == d.data.group && cut_ori.value == 1) return 1
              if (cut_number.value == 18) return 1
              else return 0.2
            })
            .on("mouseover", function (event,d) { 
              const subGroupName = d3.select(this.parentNode).datum().key

              d3.selectAll(".myRect").style("opacity", 0.2)
              d3.selectAll(".key-"+subGroupName).style("opacity",1)
              const tooltip = d3.select("#cttooltip")
              tooltip.transition().duration(200)
                  .style("opacity", 0.9)
              tooltip.html(`<strong>类型：</strong>${myDict[subGroupName]}<br/><strong>流量：</strong>${d.data[subGroupName]}`)
                  .style("left", (event.pageX - 5) + "px")    
                  .style("top", (event.pageY + 28) + "px")
            })
            .on("mouseleave", function (event,d) {
              d3.selectAll(".myRect").style("opacity",1)
              const tooltip = d3.select("#cttooltip")
              tooltip.transition().duration(10).style("opacity", 0)
            })
    })

    svg.append("text")
      .attr("x", svgWidth.value / 2 + 10)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("断面车流量类型");
    }

onMounted(() => {
  drawChart()
})

watch(() => cut_number.value, (newValue) => {
    drawChart()
})

</script>

<template>
  <div class="p-1">
    <svg ref="Plot" :width="svgWidth" :height="svgHeight">
      <g class="ct-container"></g>
    </svg>
    <div id="cttooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
