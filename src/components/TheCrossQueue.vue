<script setup lang="ts">
import * as d3 from 'd3'
import useDataStore from '../stores/data'
import { ElScrollbar } from 'element-plus'

const svgWidth = ref(window.innerWidth * 0.29)
const svgHeight = ref(window.innerHeight * 0.21)

const store = useDataStore()
const cross_i = computed(() => store.cross_i)
const time_i = computed(() => store.time_i)
const group = ref('all_directions')
const options = [{value:'all_directions', label: '全部'}, {value:'east', label: '东向'}, {value:'west', label: '西向'}, {value:'north', label: '北向'}, {value:'south', label: '南向'}]

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

function drawChart() {
    const svg = d3.select(".crq-container")
    svg.selectAll("*").remove()

    const time = JSON.parse(JSON.stringify(time_i.value))
    const cross = JSON.stringify(cross_i.value)
    const dataName = '/processed_data/intersection_' + cross + '_' + group.value + '.json'

    d3.json(dataName).then(function(data) {
        const subData = data
            // .filter(d => d.time < 1681369200 + (time + 1) * 30 * 60 && d.time >= 1681369200 + time * 30 * 60)
            .map(function(d, index) {
                return [
                    { time: new Date((d.time - 8*60*60) * 1000), type: 'total', value: +d.total },
                    { time: new Date((d.time - 8*60*60) * 1000), type: 'queue', value: +d.queue },
                ];
            }).flat();
        // console.log(subData)

        const xScale = d3.scaleTime()
            .domain(d3.extent(subData, d => d.time))
            .range([0, svgWidth.value * 17]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(subData, d => d.value)]) // 26
            .range([svgHeight.value * 0.92, svgHeight.value * 0.05]);
        
        const areaTotal = d3.area()
            .x(d => xScale(d.time))
            .y0(svgHeight.value * 0.92)
            .y1(d => yScale(d.value))
            .curve(d3.curveBasis);

        const areaQueue = d3.area()
            .x(d => xScale(d.time))
            .y0(d => yScale(d.value))
            .y1(svgHeight.value * 0.92)
            .curve(d3.curveBasis);

        svg.append("path")
            .datum(subData.filter(d => d.type === 'total'))
            .attr("class", "area-total")
            .attr("d", areaTotal)
            .attr("fill",'#90be6d');

        svg.append("path")
            .datum(subData.filter(d => d.type === 'queue'))
            .attr("class", "area-queue")
            .attr("d", areaQueue)
            .attr("fill",'#f9c74f');

        svg.append("g")
            .attr("transform", `translate(0, ${svgHeight.value * 0.92})`)
            .call(d3.axisBottom(xScale).ticks(30))
            .selectAll("text") // 选择所有刻度文字
            .attr("transform", "translate(20, 0)"); ;

        const svg1 = d3.select(".y-container")
        svg1.selectAll("*").remove()
        svg1.append("g")
            .attr("transform", `translate(${svgWidth.value * 0.05}, 0)`)
            .call(d3.axisLeft(yScale));
})}

onMounted(() => {
    drawChart()
})

watch(() => time_i.value, (newValue) => {
    scrollbarRef.value!.setScrollLeft(newValue * svgWidth.value * 17 / 18)
})

watch(() => cross_i.value, (newValue) => {
    drawChart()
})
watch(() => group.value, (newValue) => {
    drawChart()
})
</script>

<template>
  <div class="p-1"  style="overflow: auto;">
    <div class="flex items-center">
        <el-select v-model="group" placeholder="All" class="ml-4" size="small">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            />
        </el-select>
        <strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;路口{{cross_i}}排队车辆统计</strong>
    </div>
    <div class="flex items-center">
        <svg width="35" :height="svgHeight">
            <g class="y-container"></g>
        </svg>
        <el-scrollbar ref="scrollbarRef" style="flex: 1">
            <svg ref="Plot" :width="svgWidth * 17" :height="svgHeight">
                <g class="crq-container"></g>
            </svg>
        </el-scrollbar>
    </div>
    <div id="crqtooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>
