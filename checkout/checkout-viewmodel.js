import { Auth } from '/_models/auth/auth.js'
import { WebkitInputRangeFillLower } from '/webkit-input-range-fill-lower-master/dist/webkit-input-range-fill-lower.js';
import { UserService } from '/_models/user/user-service.js'
import { Utils } from '/utils/utils.js'
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { Environment } from '/_models/enviroment.js';

var env = new Environment();
var utils = new Utils();
var userIdentity = new UserService(env.URIs().identity);
// var userObjects = new UserService(env.URIs().objects);
var userService = new UserService(env.URIs().gateway);
var subscriptionService = new SubscriptionService(env.URIs().gateway)
var authService = new Auth(env.URIs().gateway);

var checkoutVue = new Vue({
    el: "#checkout",
    data()
    {
        return {
            user: {},
            logged: false,
            rewritePassword: '',
            errorMessage: '',
            accessKey: '',

            loading: false,
            urlQuery: null,
            token: '',

            showsuccess: false,
            showerro: false,

            creditCard: {
                number: '',
                verification_value: '',
                expiration: '',
                first_name: '',
                last_name: '',
                full_name: ''
            },
            cpf_cnpj: null,

            loadingForm: false,
            planValue: null,
        }
    },
    computed: {
        bandeira: function(){
            var cardnumber = this.creditCard.number.replace(/[^0-9]+/g, '');
    
            var cards = {
                elo        : /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
                mastercard : /^((5(([1-2]|[4-5])[0-9]{8}|0((1|6)([0-9]{7}))|3(0(4((0|[2-9])[0-9]{5})|([0-3]|[5-9])[0-9]{6})|[1-9][0-9]{7})))|((508116)\\d{4,10})|((502121)\\d{4,10})|((589916)\\d{4,10})|(2[0-9]{15})|(67[0-9]{14})|(506387)\\d{4,10})/,
                diners    : /(36[0-8][0-9]{3}|369[0-8][0-9]{2}|3699[0-8][0-9]|36999[0-9])/,
                hipercard  : /^606282|^3841(?:[0|4|6]{1})0/,
                amex      : /^3[47][0-9]{13}$/,
                visa      : /^4[0-9]{15}$/,
            };
    
            for (var flag in cards) {
                if(cards[flag].test(cardnumber)) {
                    if (flag == 'visa') {
                        return '/_assets/_icons/icons-pagamento/visa.svg'
                    }
                    else if(flag == 'amex'){
                        return '/_assets/_icons/icons-pagamento/amex.svg'
                    }
                    else if(flag == 'diners'){
                        return '/_assets/_icons/icons-pagamento/diners.svg'
                    }
                    else if(flag == 'elo'){
                        return '/_assets/_icons/icons-pagamento/elo.svg'
                    }
                    else if(flag == 'hipercard'){
                        return '/_assets/_icons/icons-pagamento/hipercard.svg'
                    }
                    else if(flag == 'mastercard'){
                        return '/_assets/_icons/icons-pagamento/mastercard.svg'
                    }
                }
            }    

            return '/_assets/_icons/icons-pagamento/padrao.svg'
        }
    },
    async mounted()
    {
        var url = new URL(window.location.href);
        var planParam = url.searchParams.get("plan");

        var slider = document.getElementById("bar");
        // slider.addEventListener('input', () =>
        // {
        //     window.handleSliderx();
        // }, true);

        if (planParam)
        {
            slider.value = planParam;
            //slider.oninput();
            //slider.onchange();
            // slider.addEventListener('DOMSubtreeModified', this.handleSlider, false);

        }

        this.handleSlider();

        this.urlQuery = window.location.href.split('?')[1];
        this.user = env.GetLocalStorage('user', true);
        this.token = env.GetLocalStorage("token");

        await authService.authVerify(this.token);

        if (this.user.name) {
            this.creditCard.full_name = this.user.name
        }
        if (this.user.cpf) {
            this.cpf_cnpj = this.user.cpf
        }

        console.log(this.urlQuery)

        Iugu.setAccountID(env.URIs().iuguAccountId);

        if (env.env == "local" || env.env == "dev" || env.env == "stage")
        {
            Iugu.setTestMode(true);

            this.creditCard = {
                number: '4111111111111111',
                verification_value: '111',
                expiration: '12/2030',
                first_name: 'Teste',
                last_name: '',
                full_name: 'Teste'
            }
        }
    },
    methods: {
        handleSlider()
        {
            var slider = document.getElementById("bar");
            var output = document.getElementById("planValue");
            var allpointValue = document.getElementById("allpointValue");
            output.innerHTML = slider.value;
            allpointValue.innerHTML = parseFloat(slider.value) + parseFloat(slider.value) / 10;

            // slider.oninput = function ()
            // {
            //     //var val = !value ? this.value : value;

            //     output.innerHTML = this.value;
            //     allpointValue.innerHTML = parseFloat(this.value) + parseFloat(this.value) / 10;
            // }

            this.planValue = slider.value;
        },
        closeModal()
        {
            this.showsuccess = false;
            this.showerro = false;
        },
        backButton()
        {
            window.location.href = '/'
        },
        redirectProfile()
        {
            window.location.href = '/profile'
        },

        createTokenPayment()
        {
            this.loadingForm = true
            var nameArray = this.creditCard.full_name.split(' ');
            var dateArray = this.creditCard.expiration.split('/')
            var cardNumber = this.creditCard.number.replace(/\s/g, '');
            var cnpj_cpf = this.cpf_cnpj.replace(/[^\d]+/g,'')

            console.log(nameArray[nameArray.length - 1])

            var cc = Iugu.CreditCard(cardNumber, dateArray[0], dateArray[1], nameArray[0], nameArray[nameArray.length - 1], this.creditCard.verification_value);

            var that = this;

            Iugu.createPaymentToken(cc, async function (response)
            {
                console.log(response)
                if (response.errors)
                {
                    that.loadingForm = false
                    checkoutVue.showerro = true;
                }
                else
                {
                    var payload = {
                        plan: "21_" + checkoutVue.planValue,
                        token: response.id,
                        name: that.creditCard.full_name,
                        legal_number: cnpj_cpf
                    }

                    var response = await subscriptionService.createSubscription(env.GetLocalStorage("token"), payload);

                    if (response.ok)
                    {
                        that.loadingForm = false
                        checkoutVue.showsuccess = true
                    }
                    else
                    {
                        that.loadingForm = false
                        checkoutVue.showerro = true;
                    }

                }
            })
        }

    }
})

new WebkitInputRangeFillLower({
    selectors: ['myRange'],
    gradient: 'rgb(236, 0, 128), rgb(236, 0, 128)'
});

window.checkoutVue = checkoutVue;

export { checkoutVue };