<script setup lang="ts">
import * as d3 from 'd3'
import data from '../assets/orientation_num_dic.json'
import useDataStore from '../stores/data'

const svgWidth = ref(window.innerWidth * 0.29)
const svgHeight = ref(window.innerHeight * 0.25)
const store = useDataStore()

function drawChart() {
    const svg = d3.select(".cf-container")
    svg.selectAll("*").remove()

    // console.log(data)

    const xScale = d3.scaleLinear()
        .domain([0, 19])
        .range([svgWidth.value * 0.08, svgWidth.value * 0.96]);

    const yScale = d3.scaleLinear()
        .domain([0, 27000])
        .range([svgHeight.value * 0.89, svgHeight.value * 0.05]);

    // 创建折线生成器
    const line_ew = d3.line()
        .x((d, i) => xScale(i + 1))
        .y((d, i) => yScale(d[0]));

    const line_sn = d3.line()
        .x((d, i) => xScale(i + 1))
        .y((d, i) => yScale(d[1]));

    // 在 SVG 中添加折线路径
    svg.append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "#264653")
        .attr("stroke-width", 2)
        .attr("d", line_ew);

    svg.append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "#2a9d8f")
        .attr("stroke-width", 2)
        .attr("d", line_sn);

    svg.append("g")
        .attr("transform", `translate(0, ${svgHeight.value * 0.89})`)
        .call(d3.axisBottom(xScale).tickValues(d3.range(1, 20)).tickFormat(function (d) {
            // 自定义刻度值的显示方式
            const hours = (7 + Math.floor((d - 1) / 2)).toString();
            if (d % 2 == 0) { var minutes = "30"; }
            else { var minutes = "00"; }
            return `${hours}:${minutes}`;
        }));

    svg.append("g")
        .attr("transform", `translate(${svgWidth.value * 0.08}, 0)`)
        .call(d3.axisLeft(yScale));

    // 添加图例
    svg.append("text")
        .attr("x", xScale(18) - 30)
        .attr("y", yScale(25000))
        .text("东西向");

    svg.append("text")
        .attr("x", xScale(18) - 30)
        .attr("y", yScale(25000) + 20)
        .text("南北向");

    svg.append("rect")
        .attr("x", xScale(18) - 65) //width是svg的宽度，x属性用来调整位置
        .attr("y", yScale(25000) - 7)
        .attr("width", 30)
        .attr("height", 3) //设低一些就是线，高一些就是面，很好理解
        .style("fill", '#264653');

    svg.append("rect")
        .attr("x", xScale(18) - 65) //width是svg的宽度，x属性用来调整位置
        .attr("y", yScale(25000) - 7 + 20)
        .attr("width", 30)
        .attr("height", 3) //设低一些就是线，高一些就是面，很好理解
        .style("fill", '#2a9d8f');

    // 添加标题
    svg.append("text")
    .attr("x", svgWidth.value / 2 + 10)
    .attr("y", 15)
    .attr("text-anchor", "middle")  // 设置文本居中对齐
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("断面车流量统计");

    const verticalLine = svg.append("line")
        .attr("class", "vertical-line")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4") // 设置虚线样式
        .style("opacity", 0); // 初始时隐藏虚线

    // 添加可触碰点
    svg.selectAll(".ew-circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "ew-circle")
        .attr("fill", '#264653')
        .attr('cx', (d, i) => xScale(i + 1))
        .attr('cy', (d, i) => yScale(d[0]))
        .attr('r', 4)
        .on("mouseover", function (event, d) {

            d3.select(this).transition().attr('r', 5);
            var selectedIndex = data.findIndex(function (item) {
                return item === d;
            });
            d3.selectAll(".sn-circle").attr("r", function (d, i) {
                if (i == selectedIndex) { return 5 }
                else { return 4 }
            })

            store.updateCutNumber(selectedIndex)
            store.updateCutOri(0)

            const hours = (7 + Math.floor(selectedIndex / 2)).toString().padStart(2, '0');
            const hours_2 = (7 + Math.floor((1 + selectedIndex) / 2)).toString().padStart(2, '0');
            if (selectedIndex % 2 == 0) { var minutes = "00"; var minutes_2 = "30"; }
            else { var minutes = "30"; var minutes_2 = "00"; }

            verticalLine
                .attr("x1", xScale(selectedIndex + 1))
                .attr("x2", xScale(selectedIndex + 1))
                .attr("y1", yScale.range()[0])
                .attr("y2", yScale.range()[1])
                .style("opacity", 1);

            const tooltip = d3.select("#cftooltip1")
            tooltip.transition().duration(200)
                .style("opacity", 0.9)
            tooltip.html(`<strong>${hours}:${minutes}-${hours_2}:${minutes_2}</strong><br/>东西向：${d[0]}<br/>南北向：${d[1]}`)
                .style("left", (event.pageX - 5) + "px")    
                .style("top", (event.pageY + 28) + "px")
        })
        .on("mouseout", function (event, i) {
            store.updateCutNumber(18)
            const tooltip = d3.select("#cftooltip1")
            tooltip.transition().duration(200).style("opacity", 0)
            verticalLine.style("opacity", 0);
            d3.select(this).transition().attr('r', 4);
            d3.selectAll(".sn-circle").attr("r", 4);
        })
    svg.selectAll(".sn-circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "sn-circle")
        .attr("fill", '#2a9d8f')
        .attr('cx', (d, i) => xScale(i + 1))
        .attr('cy', (d, i) => yScale(d[1]))
        .attr('r', 4)
        .on("mouseover", function (event, d) {
            d3.select(this).transition().attr('r', 5);
            var selectedIndex = data.findIndex(function (item) {
                return item === d;
            });
            d3.selectAll(".ew-circle").attr("r", function (d, i) {
                if (i == selectedIndex) { return 5 }
                else { return 4 }
            })

            store.updateCutNumber(selectedIndex)
            store.updateCutOri(1)

            const hours = (7 + Math.floor(selectedIndex / 2)).toString().padStart(2, '0');
            const hours_2 = (7 + Math.floor((1 + selectedIndex) / 2)).toString().padStart(2, '0');
            if (selectedIndex % 2 == 0) { var minutes = "00"; var minutes_2 = "30"; }
            else { var minutes = "30"; var minutes_2 = "00"; }

            verticalLine
                .attr("x1", xScale(selectedIndex + 1))
                .attr("x2", xScale(selectedIndex + 1))
                .attr("y1", yScale.range()[0])
                .attr("y2", yScale.range()[1])
                .style("opacity", 1);

            const tooltip = d3.select("#cftooltip2")
            tooltip.transition().duration(200)
                .style("opacity", 0.9)
            tooltip.html(`<strong>${hours}:${minutes}-${hours_2}:${minutes_2}</strong><br/>南北向：${d[1]}<br/>东西向：${d[0]}`)
                .style("left", (event.pageX - 5) + "px")    
                .style("top", (event.pageY + 28) + "px")
        })
        .on("mouseout", function (event, i) {
            store.updateCutNumber(18)
            const tooltip = d3.select("#cftooltip2")
            tooltip.transition().duration(200).style("opacity", 0)
            verticalLine.style("opacity", 0);
            d3.select(this).transition().attr('r', 4);
            d3.selectAll(".ew-circle").attr("r", 4);
        })
    }


onMounted(() => {
  drawChart()
})

</script>

<template>
  <div class="p-1">
    <svg  :width="svgWidth" :height="svgHeight">
      <g class="cf-container"></g>
    </svg>
    <div id="cftooltip1" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
    <div id="cftooltip2" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
