var onboardingVue = new Vue({
    el:'#onboarding',
    data(){
        return{
            nextStep: false,
            loading: false,
            noSubscription: false
        }
    },
    mounted(){
        
    },
    methods:{
        metodo(){
            window.location.href = '/'
        }
    }
})