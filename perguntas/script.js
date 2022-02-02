import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'

var env = new Environment();
var subscriptionService = new SubscriptionService(env.URIs().gateway);

var homeVue = new Vue({
    el: '#perguntas',
    data() {
        return {
            slide: {
                one: true,
                two: false,
                three: false
            },
            token: '',
            tabSelected: 'hotel',
            logged: false,
            showsuccess: false,
            showerro: false,
            me: {},
            loading: true,
            promos: [],
            
            noSubscription: false,
            token: '',
        }
    },
    async created() {

        setTimeout(() => {
            this.loading = false
        }, 2000);
    },
    mounted(){

        var user = env.GetLocalStorage('user');
        this.token = env.GetLocalStorage("token");

        if (user != null) {
            this.logged = true;
          }

        this.getMySubscription();

    },
    methods: {
        openDrawer(value) {
            if (document.getElementsByClassName('common-questions-item')[value].classList.contains('drawerActive')) {
                document.getElementsByClassName('common-questions-item')[value].classList.remove('drawerActive')
            } else {
                document.getElementsByClassName('common-questions-item')[value].classList.add('drawerActive')
            }
        },
        closeModal() {
            this.showsuccess = false;
            this.showerro = false;
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
});


window.homeVue = homeVue

export { homeVue }