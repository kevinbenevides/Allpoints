import { WebkitInputRangeFillLower } from '/webkit-input-range-fill-lower-master/dist/webkit-input-range-fill-lower.js';
import { PromosService } from '/_models/promo/promo-service.js';
import { Auth } from '/_models/auth/auth.js'
import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { OptionService } from '/_models/option/option-service.js';

var env = new Environment();
var authService = new Auth(env.URIs().gateway);
var subscriptionService = new SubscriptionService(env.URIs().gateway);
var optionService = new OptionService(env.URIs().gateway);
var promoService = new PromosService(env.URIs().gateway);
// var balanceService = new BalanceService(env.URIs().gateway);

var homeVue = new Vue({
    el: '#home',
    data() {
        return {
            slide: {
                one: true,
                two: false,
                three: false
            },
            token: '',
            tabSelected: 'hotel',
            cards: [1, 2, 3, 4, 5, 6],
            cardsSlider: [],
            cardIndex: 0,
            slideIndex: 0,
            cardSliderMax: 5,
            cardSliderMin: 0,
            logged: false,
            showsuccess: true,
            showerro: false,
            showWelcome: false,
            me: {},
            loading: true,
            promos: [],
            subscription: false,
            sliderValue: 10,
            windowSize: 0,
            showPromo: true
        }
    },
    async mounted() {
        const response = await optionService.getOptions()
        this.showPromo = response[0].showPromo
    },
    async created() {
        setInterval(() => {
            this.toggleSlideAuto();
        }, 5000);

        await this.getPromos();
        var elms = document.getElementsByClassName('splide');
        new Splide(elms[0], { autoplay: true, type: 'loop' }).mount();
        if(this.showPromo){
            new Splide(elms[1], { perPage: 4, breakpoints: { 1400: { perPage: 3 }, 1000: { perPage: 2 }, 800: { perPage: 1 } }, gap: '10px', rewind: true }).mount();
        }
        
        this.handleSlider();

        var isNewUser = localStorage.getItem('newUser')
        if (isNewUser) {
            this.showWelcome = true
        }

        var user = env.GetLocalStorage('user');
        this.token = env.GetLocalStorage("token")

        if (user != null) {
            this.logged = await authService.isLogged(this.token);
        }

        if (this.logged) {
            await this.userInfos()
            await this.getMySubscription();
        }

        if (screen.width < 1488) {
            this.promos = this.promos.slice(0, 4)
        }
        
        this.loading = false
    },
    methods: {
        userInfos() {
            this.me = env.GetLocalStorage("user", true)
        },

        async getPromos() {
            this.promos = await promoService.getPromos();
        },

        async getMySubscription() {
            var response = await subscriptionService.mySubscription(this.token);

            if (response) {
                this.subscription = true;
            } else {
                this.subscription = false;
            }
        },

        toggleSlide(slide) {
            var slidePosition = this.slide
            switch (slide) {
                case 'one':
                    slidePosition.two = false
                    slidePosition.three = false
                    slidePosition.one = true
                    break;
                case 'two':
                    slidePosition.one = false
                    slidePosition.three = false
                    slidePosition.two = true
                    break;
                case 'three':
                    slidePosition.one = false
                    slidePosition.two = false
                    slidePosition.three = true
                    break;
                default:
                    break;
            }
        },
        toggleSlideAuto() {
            this.slideIndex++
            switch (this.slideIndex) {
                case 1:
                    this.toggleSlide('one')
                    break;
                case 2:
                    this.toggleSlide('two')
                    break;
                case 3:
                    this.toggleSlide('three')
                    break;
                case 4:
                    this.slideIndex = 0
                    this.toggleSlide('one')
                    break;
                default:
                    break;
            }
        },
        openDrawer(value) {
            if (document.getElementsByClassName('common-questions-item')[value].classList.contains('drawerActive')) {
                document.getElementsByClassName('common-questions-item')[value].classList.remove('drawerActive')
            } else {
                document.getElementsByClassName('common-questions-item')[value].classList.add('drawerActive')
            }
        },
        changeTabs(tab) {
            console.log('teste')
            switch (tab) {
                case 'hotel':
                    this.tabSelected = 'hotel'
                    break;

                case 'fly':
                    this.tabSelected = 'fly'
                    break;

                case 'car':
                    this.tabSelected = 'car'
                    break;

                case 'buss':
                    this.tabSelected = 'buss'
                    break;

                case 'security':
                    this.tabSelected = 'security'
                    break;

                default:
                    break;
            }
        },
        sliderCards(type) {
            switch (type) {
                case 'next':
                    this.cardIndex++
                    break;

                case 'previus':
                    this.cardIndex--
                    break;

                default:
                    break;
            }

            this.cardSliderMax = 5 + this.cardIndex
            this.cardSliderMin = 0 + this.cardIndex

            this.cardsSlider = this.cards.slice(this.cardSliderMin, this.cardSliderMax)
            console.log(this.cardsSlider)
        },
        closeModal() {
            this.showsuccess = false;
            this.showerro = false;
        },
        closeModalWelcome() {
            this.showWelcome = false
            localStorage.removeItem('newUser')
        },
        redirectSubscription() {
            if (env.GetLocalStorage('user') != null) {
                window.location.href = '/checkout/?plan=' + this.sliderValue;
            } else {
                window.location.href = '/create-profile/?subscription=false';
            }
        },
        handleSlider() {
            var slider = document.getElementById("bar");
            var output = document.getElementById("planValue");
            var allpointValue = document.getElementById("allpointValue");
            output.innerHTML = slider.value;
            this.sliderValue = slider.value;
            allpointValue.innerHTML = parseFloat(slider.value) + parseFloat(slider.value) / 10;

            slider.oninput = function () {
                output.innerHTML = this.value;
                allpointValue.innerHTML = parseFloat(this.value) + parseFloat(this.value) / 10;
            }
        },
        redirectVaiDeVisa() {
            window.location.href = "/vaidevisa"
        },
        redirectPerguntas() {
            window.location.href = "/perguntas"
        },
        redirectEmpresas() {
            window.location.href = '/empresas'
        },
        searchFormRedirect(param) {
            switch (param) {
                case 'car':
                    window.location.href = "https://www.rentcars.com/pt-br/?utm_source=allpoints_hotels&utm_medium=newslleter"
                    break;
                case 'fly':
                    window.location.href = "https://www.viajanet.com.br/passagens-aereas?utm_source=allpoints_hotels&utm_medium=newslleter&utm_content=passagensaereas"
                    break;

                default:
                    break;
            }
        }
    }
});

document.addEventListener("niara-search-ready", function (e) {
    console.log('niara-search-ready!')
    console.log(document.getElementById('search-form'))
    e.detail.initSearchForm(document.getElementById("search-form"), {
        landingPage: "hoteis.allpoints.club",
        isCustomDomain: true,
        customSearch: ({
            criteriaQueryString,
            landingPagePrefix,
            queryStringStringify
        }) => {
            var access_token = localStorage["token-live"];
            if (access_token) {
                window.location.href = landingPagePrefix + "/allpoints/auth#" + queryStringStringify({access_token: access_token, redirect_to: "/q?" + criteriaQueryString,});
            } else {
                window.location.href = landingPagePrefix + "/q?" + criteriaQueryString
            }
        },
    });
})

new WebkitInputRangeFillLower({
    selectors: ['myRange'],
    gradient: 'rgb(236, 0, 128), rgb(236, 0, 128)'
});

new ClickBusWidget({

    orientation: 'horizontal',

    tracking: {

        source: 'allpoints',

        medium: 'affiliate',

        campaign: 'widget'

    },

    }).init();

    
window.homeVue = homeVue

export { homeVue }