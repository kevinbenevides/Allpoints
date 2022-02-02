var niaraVue = new Vue({
    el: "#niara",
    data(){
        return{
            user:{
                email: "",
                password: ""
            },
            token:false
        }
    },
    mounthed(){
    },
    methods:{
        async login(){
           window.location.href = "https://stage.allpoints.club/login/index.html?app_id=8453233387443368&state=params&redirect_uri=https://stage.allpoints.club/niara/index.html"
        }
    }
})