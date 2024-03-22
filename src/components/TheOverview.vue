<template>
  <div id="overview" ref="parentContainer">
    <div id="d3-map"  :width="svgWidth" :height="svgHeight"></div>
    <el-button @click="toggleAnimation" class="ml-4 mr-4">{{ isAnimating ? '暂停' : '播放' }}</el-button>
    <input type="range" min="0" :max="keys.length - 1" v-model="timeIndex" @input="updatePoints" class="mr-4"/>
    <span>{{ keys[timeIndex] }}</span>
    <div id="otooltip" class="absolute bg-white p-1 border border-gray-300 opacity-0"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import geojson from '../assets/boundary.json'; 
import crosswalk from '../assets/crosswalk.json'; 
import lane from '../assets/lane.json'; 
import signal from '../assets/signal.json'; 
import stopline from '../assets/stopline.json'; 
import data from '../assets/part.json'; 

const svgWidth = ref(window.innerWidth * 0.53)
const svgHeight = ref(window.innerHeight * 0.46)

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
const color = d3.scaleOrdinal()
        .domain([-1, 1, 2, 3, 4, 6, 7, 10])
        .range(['#264653', '#287271', '#2a9d8f', '#8ab17d', '#e9c46a', '#efb366', '#f4a261', '#e76f51']);

// 数据格式：{"id": 194180476, "is_moving": 1, "velocity": 11.173528, "type": 3, "time_meas": 1681340401599818, "x": -153.80717, "y": -44.975807}
// time_meas按由小到大顺序排列

// 对记录按秒分组
let group_data = d3.group(data.map(d=>{return {d,time:new Date(Math.floor(d.time_meas/1000000)*1000)}}),d=>d.time)
const firstKey = group_data.keys().next().value //最开始时间的键值

export default {
  name: 'D3Map',
  data() {
    return {
      isAnimating: true,
      timeIndex: 0,
      keys : Array.from(group_data.keys()), // 获取所有时间键值
      parentContainerWidth : 0,
      widthToHeightRatio: 0.3, //svg 宽高比
      projection: null,
      path: null,
    };
  },
  mounted() {
    // 投影方法
    this.projection = d3.geoIdentity().reflectY(true).fitSize([svgWidth.value, svgHeight.value], geojson);
    this.path = d3.geoPath().projection(this.projection);

    this.drawMap();
    this.updatePoints(); // 调用更新点的方法
    this.animationInterval = setInterval(this.updatePoints, 1000); // 每隔1秒钟更新一次点的位置
    // 创建缩放对象
    const zoom = d3.zoom()
      .scaleExtent([0.9, 8]) // 设置缩放范围，最小为 1 倍，最大为 8 倍
      .on('zoom', this.zoomed); // 创建 zoomed 方法用于处理缩放事件
    // 将缩放对象应用到地图的 SVG 元素上
    d3.select('#d3-map svg').call(zoom);
  },
  methods: {
    drawMap() {
      const svg = d3
        .select('#d3-map')
        .append('svg')
        .attr('width', svgWidth.value)
        .attr('height', svgHeight.value);

      const background = svg.append('g')

      background
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'lightblue')
        .style('stroke-width', 2);

      background
        .selectAll('.crosswalk')
        .data(crosswalk.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'green')
        .style('stroke-width', 2)
        .attr('class', 'crosswalk');

      background
        .selectAll('.stopline')
        .data(stopline.features)
        .enter()
        .append('path')
        .attr('class', 'stopline')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'red')
        .style('stroke-width', 2);

      background
        .selectAll('.lane')
        .data(lane.features)
        .enter()
        .append('path')
        .attr('class', 'lane')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'darkgray')
        .style('stroke-width', 1);

      background
        .selectAll('circle')
        .data(signal.features)
        .enter()
        .append('circle')
        .attr('cx', d => this.projection(d.geometry.coordinates)[0])
        .attr('cy', d => this.projection(d.geometry.coordinates)[1])
        .attr('r', 2)
        .style('fill', 'black');
      // 静态数据全部载入，尺寸/颜色需要调整

      // 参与者容器
      const p = svg.append('g').attr("id","p")
      p
        .selectAll(".ptts")
        .data(group_data.get(firstKey))
        .enter()
        .append('circle')
        .attr('cx', d=>this.projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>this.projection([d.d.x,d.d.y])[1])
        .attr('r', 3) 
        .attr('id', d=>d.d.id)
        .classed('ptts',true)
        .attr('fill', 'red'); 
        // 需要根据种类确定大小颜色
        // 需要加入tooltip，查看点的信息
        // 需要加入图例，等所有视图合并后确定颜色
    },
    // 更新点的位置的方法
    updatePoints() {
      let currentKey = d3.select('#p').selectAll(".ptts").datum().time;
      let currentIndex = this.keys.findIndex(key => {
        // 在这里进行临时的转换操作，将时间格式转换为 Date 对象
        let keyTime = new Date(key);
        let currentKeyTime = new Date(currentKey);
        return keyTime.getTime() === currentKeyTime.getTime();
      });
      let updateKey; // 声明 updateKey 在方法内部的范围
      if (!this.isAnimating && this.keys[this.timeIndex]==currentKey) {  // 没拖动时间轴+暂停状态，什么都不做
        return
      }
      else if (this.isAnimating && this.keys[this.timeIndex]==currentKey) {// 没拖动时间轴+播放状态，往后面一个key更新
        if (currentIndex==this.keys.length-1) { //播放到最后了,结束
          this.toggleAnimation()
          return
        }
        updateKey = this.keys[currentIndex + 1]
        this.timeIndex = currentIndex + 1 
      }
      else if (this.keys[this.timeIndex]!=currentKey) { // 拖动了时间轴
        updateKey = this.keys[this.timeIndex]
      }
      else {
        console.log('fuck')
      }
      // console.log(updateKey)  //check

      // 清空现有的点
      d3.select('#d3-map')
        .selectAll('.ptts')
        .remove();

      const p = d3.select('#p'); // 选择 p 容器
      p
        .selectAll(".ptts")
        .data(group_data.get(updateKey))
        .enter()
        .append('circle')
        .attr('cx', d=>this.projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>this.projection([d.d.x,d.d.y])[1])
        .attr('r', 3) 
        .attr('id', d=>d.d.id)
        .classed('ptts',true)
        .attr('fill', d => {
          const type = data.filter(item => item.id == d.d.id)[0].type
          return color(type)
        })
        .on("mouseover", function (event, d) {
          const tooltip = d3.select("#otooltip")
          tooltip.transition().duration(200)
              .style("opacity", 0.9)
          tooltip.html(`<strong>id:</strong>${d.d.id}<br/><strong>正在移动:</strong>${'是' ? d.d.is_moving == 1 : '否'}<br/><strong>类型:</strong>${myDict[d.d.type]}<br/><strong>速度:</strong>${d.d.velocity}`)
              .style("left", (event.pageX - 5) + "px")    
              .style("top", (event.pageY + 28) + "px")
        })
        .on("mouseout", function (event, i) {
          const tooltip = d3.select("#otooltip")
            tooltip.transition().duration(200).style("opacity", 0)
        });
    },
    toggleAnimation() {
      this.isAnimating = !this.isAnimating;
      if (this.isAnimating) {
        if (this.timeIndex == this.keys.length-1) { // 重播的核心逻辑
          this.timeIndex = 0;
        }
        this.animationInterval = setInterval(this.updatePoints, 1000);
      } else {
        clearInterval(this.animationInterval);
      }
    },
    // 处理缩放事件的方法
    zoomed(event) {
      const { transform } = event;
      d3.select('#d3-map g').attr('transform', transform); // 将缩放变换应用到地图的 g 元素上
      d3.select('#d3-map #p').attr('transform', transform); // 将缩放变换应用到 p 容器上
    },
  },
};
</script>

<style>
input[type="range"] {
  width: 300px; /* 设置input[type="range"]的宽度 */
}
</style>