<script setup lang="ts" generic="T extends any, O extends any">
  defineOptions({
    name: 'IndexPage',
  })
</script>

<template>
  <div class="m-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] flex border-2 border-slate-50 bg-white p-1">
    <div class="h-full w-60% flex-shrink-0 bg-slate-50 p-1">
      <div class="h-50% w-full bg-white border-2 flex">
        <div class="h-full w-90% bg-white">
          <TheOverview />
        </div>
        <div class="h-full w-10% bg-white">
          <TheLabel />
        </div>
      </div>
      <div class="h-25% w-full bg-white flex">
        <div class="h-full w-50% bg-white flex border-2">
          <TheCutFlow />
        </div>
        <div class="h-full w-50% bg-white flex border-2">
          <TheCutType />
        </div>
      </div>
      <div class="h-25% w-full bg-white flex">
        <div class="h-full w-50% bg-white flex border-2">
          <TheCrossFlow />
        </div>
        <div class="h-full w-50% bg-white flex border-2">
          <TheCrossQueue />
        </div>
      </div>
    </div> 
    <div class="h-full w-40% flex-shrink-0 bg-slate-50 p-1">
      <div class="h-25% w-full bg-white flex border-2">
        <TheCohortCluster />
      </div>
      <div class="h-25% w-full bg-white flex border-2">
        <div class="h-full w-50% bg-white flex border-2">
          <TheRadar />
        </div>
        <div class="h-full w-50% bg-white flex border-2">
          <TheCohortRadar />
        </div>
      </div>
      <div class="h-50% w-full bg-white border-2">
        <TheSpeedAndFlow />
      </div>
    </div>
  </div>
</template>
