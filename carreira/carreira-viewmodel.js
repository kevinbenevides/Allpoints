import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'

var env = new Environment();
var subscriptionService = new SubscriptionService(env.URIs().gateway);

var carreiraVue = new Vue({
    el:'#carreira',
    data(){
        return{
            logged: false,
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
        redirectHome(){
            window.location.href = '/'
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