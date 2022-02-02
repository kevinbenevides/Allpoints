import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { Utils } from '/utils/utils.js'
import { UserService } from '/_models/user/user-service.js'

var env = new Environment();
var utils = new Utils();
var userService = new UserService(env.URIs().gateway);
var subscriptionService = new SubscriptionService(env.URIs().gateway);

var empresasVue = new Vue({
    el: '#para-empresas',
    data() {
        return {
            logged: false,
            loading: true,
            loadingForm: false,

            name: '',
            email: '',
            phone: '',
            company_name: '',
            position: '',

            message: '',
            showModal: false,
            telCode: '55',

            noSubscription: false,
            token: '',
        }
    },
    created() {
    },
    async mounted() {
        this.loading = true;

        document.getElementById('empresa-number').addEventListener('input', async function (e) {
            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ')' + x[2] + '-' + x[3];
        })
        var user = env.GetLocalStorage('user');
        this.token = env.GetLocalStorage("token");

        if (user != null) {
            this.logged = true;
        }

        await this.getMySubscription();

        this.loading = false
    },
    methods: {
        redirectHome() {
            window.location.href = '/'
        },
        async registerEmpresa() {
            this.message = ''
            this.loadingForm = true
            if (this.name != '' && this.company_name != '' && this.position != '' && utils.emailValidation(this.email) === true) {
                var payload = {
                    company_name: this.company_name,
                    email: this.email,
                    label: 'lead',
                    name: this.name,
                    phone: this.phone,
                    position: this.position
                }
                await userService.registerLead(payload);
                this.loadingForm = false
            } else {
                this.message = 'Dados inválidos.'
                this.loadingForm = false
            }
        },

        onChangeValue: function (value) {
            this.telCode = value
        },

        async getMySubscription() {
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