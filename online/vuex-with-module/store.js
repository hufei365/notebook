/**
* Vuex store实例
*/

const son = {
    namespaced: true,
    state:{
        sonName: 'son'
    }
    ,getters: {
        getterUpSon: (context)=>{
            return context.sonName.toUpperCase();
        }
    }
    ,mutations: {
        sonChange:(state)=>{
            state.sonName = state.sonName.replace(/\d+/g, '') + (+new Date())
        }
        ,sonA:(state)=>{
            state.sonName = state.sonName.replace(/\d+SON[A-Z]$/g, '') + (+new Date()) + 'SONA'
        }
        ,sonB:(state)=>{
            state.sonName = state.sonName.replace(/\d+SON[A-Z]$/g, '') + (+new Date()) + 'SONB'
        }
    }
}

const child = {
    namespaced: true,
    state:{ 
        childName : 'child',
        aliasName: 'childAlias'
    }
    ,mutations:{
        childChange: (state, payload)=>{
            state.childName = state.childName.replace(/\d+/g, '') + (+new Date())
        }
    }
}

const bigSon = {
    namespaced: true,
    modules:{
        son
    },
    state:{
        bigSonName:'bigSonName'
    }
    ,getters: {
        getterUpBigSon:(context)=>{
            return context.bigSonName.toUpperCase();
        }
    }
    ,mutations:{
        toUpperCase:(state)=>{
            state.bigSonName = /[a-z]/g.test(state.bigSonName) ? state.bigSonName.toUpperCase() : state.bigSonName.toLowerCase() ;
        }
    }
    ,actions: {
        bigSonAction: (context)=>{
            context.commit('toUpperCase')
        }
    }
}

const store = new Vuex.Store({
    modules: {
        bigSon,
        child
    },
    state: {
        nums: []
    }
    // getters
    ,getters: {
        
    }
    // ,actions: {
    //     actionA: () => {
    //         store.commit('increment');
    //     }
    // },
    ,mutations: {
        push(state) {
            state.nums.push(state.nums.length);
        }
    }
})