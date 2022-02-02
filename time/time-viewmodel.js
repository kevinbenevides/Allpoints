import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'

var env = new Environment();
var subscriptionService = new SubscriptionService(env.URIs().gateway);

var squadVue = new Vue({
    el:'#squad',
    data(){
        return{
            nextStep: false,
            logged: null,
            loading: true,
            noSubscription: false,
            token: '',
        }
    },
    created(){
    },
    async mounted(){

        this.loading = true;
        var user = env.GetLocalStorage('user');
        this.token = env.GetLocalStorage("token");

        if (user != null) {
            this.logged = true;
        }

        await this.getMySubscription();

        this.loading = false
    },
    methods:{
        redirectCarreira(){
            window.location.href = '/carreira'
        },

        async getMySubscription(){
            var response = await subscriptionService.mySubscription(this.token);
      
            if (response) {
                this.noSubscription = false;
            }
            else {
              this.noSubscription = true;
            }
    
        },
    }
})