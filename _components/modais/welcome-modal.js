import { BalanceService } from '/_models/balance/balance-service.js';

var env = new Environment();

Vue.component("welcome-modal", {
    name: "welcome-modal",
    data() {
        return {
            name: JSON.parse(localStorage.getItem('user-local')).name,
            balanceService: {},
            balance: {}
        }
    },
    async mounted() {
        this.balanceService = new BalanceService(env.URIs().gateway);
        await this.getMyAllpoints()
    },
    methods: {
        async getMyAllpoints() {
            var token = env.GetLocalStorage("token")

            this.balance = await this.balanceService.myBalance(token)
            if (typeof this.balance == 'object') {
                var balance = this.balance.available.toString()

                if (balance.includes('.')) {
                    this.balance.available = balance.replace('.', ',')
                } else {
                    this.balance.available = this.balance.available + ',00'
                }
            }
        },
    },
    template: /*html*/ `
<section class="modal-sucesso">
    <div class="modal-container" @click="$emit('close')">
        <div class="modal-content modal-size">
            <div class="modal-close">
                <i class="far fa-times" @click="$emit('close')"></i>
            </div>
            <p class="modal-title"> Olá, {{name}}! Seja bem-vindo(a)!</p>
            <p style="font-size: 18px;">Seu saldo atual é:</p>
            <div style="display: flex; margin-left: auto; margin-right: auto; margin-top: 12px;">
                <svg width="54" height="41" viewBox="0 0 54 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M35.383 36.3845L35.383 36.3845L48.692 23.0755C53.5127 18.2548 53.5127 10.4393 48.692 5.6186C43.8714 0.798073 36.0556 0.798073 31.235 5.6186L17.9261 18.9276L17.9261 18.9276C13.1054 23.7481 13.1054 31.5638 17.9261 36.3845C22.7468 41.2052 30.5625 41.2052 35.383 36.3845Z"
                        fill="white" stroke="#EC0080" stroke-width="2" />
                    <path
                        d="M22.0723 5.61353C17.2651 0.806435 9.47901 0.793213 4.65518 5.57393L4.6154 5.6137C-0.20513 10.4344 -0.205134 18.2499 4.61539 23.0706C4.6154 23.0706 4.6154 23.0706 4.6154 23.0706L17.9244 36.3796C22.7451 41.2003 30.5608 41.2003 35.3815 36.3796L41.9666 29.7944L42.6919 29.0691L42.6953 29.0727L46.7609 25.0071C46.265 25.0941 45.7547 25.1395 45.2338 25.1395C43.1718 25.1395 41.2763 24.4272 39.7789 23.2381L39.7424 23.2838L38.9515 22.4929L22.0723 5.61353Z"
                        fill="white" stroke="#EC0080" stroke-width="2" />
                </svg>
                <div style="margin-left: 24px;">
                    <p class="modal-number-bold" v-if="balance?.available">{{balance.available}}</p>
                    <p class="modal-number-bold" v-else>0,00</p>
                    <p>Allpoints</p>
                </div>
            </div>
            <p style="margin-top: 16px; text-align: center;">Você pode resgatar e receber cashback de Allpoints buscando sua viagem com Allpoints.Club!</p>
            <button class="modal-pink-button">COMEÇAR AGORA</button>
        </div>
    </div>
</section>
`,
})