import { defineStore } from 'pinia'

export const useDataStore = defineStore({
  id: 'data',
  state: () => {
    return {
      time_i: 0,
      cross_i :1,
      id : 206106583,
      cluster: 1,
      cut_number: 18,
      cut_ori: 0,
    }
  },
  getters: {
  },
  actions: {
    updateCrossTime(value:number) {
      this.time_i = value
    },
    updateCrossNumber(value:number) {
      this.cross_i = value
    },
    updateRadarId(value:number) {
      this.id = value
    },
    updateRadarCluster(value:number) {
      this.cluster = value
    },
    updateCutNumber(value:number) {
      this.cut_number = value
    },
    updateCutOri(value:number) {
      this.cut_ori = value
    },
  },
})

export default useDataStore
