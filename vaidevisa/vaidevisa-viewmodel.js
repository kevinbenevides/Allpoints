import { Environment } from '/_models/enviroment.js';

var env = new Environment();

var vaidevisaVue = new Vue({
    el:'#vaidevisa',
    data(){
        return{
            nextStep: false,
            logged: null,
            loading: true,

            showsuccess: false,
            showerro: false,
        }
    },
    created(){
    },
    mounted(){

        var user = env.GetLocalStorage('user');

        if (user != null) {
            this.logged = true;
        }

        this.loading = false
    },
    methods:{
        closeModal() {
            this.showsuccess = false;
            this.showerro = false;
        },
        redirectHome(){
            location.href = '/'
        }
    }
})