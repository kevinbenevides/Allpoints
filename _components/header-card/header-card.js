import { BalanceService } from '/_models/balance/balance-service.js';
import { Auth } from '/_models/auth/auth.js'
var env = new Environment();


var authService = new Auth(env.URIs().gateway);

Vue.component("header-card", {
    name: "header-card",
    props: ['logged', 'secure', 'empty', 'subscriber'],
    data() {
        return {
            is_logged: false,
            is_secure: this.secure,
            is_empty: this.empty,
            is_subscriber: this.subscriber,
            hamburgerIsOpen: false,
            userMenuIsOpen: false,
            user: {},
            balanceService: {},
            balance: {},
            token: ''
        }
    },
    async mounted() {
        this.token = env.GetLocalStorage("token")
        this.is_logged = await authService.isLogged(this.token);
        document.getElementsByTagName('main')[0].onclick = () => {
            document.getElementById('home-user-menu-desktop').classList.remove('desktop-menu-open')
        }

        env = new window.Environment();

        if (this.is_logged) {
            this.user = env.GetLocalStorage('user', true)
            this.balanceService = new BalanceService(env.URIs().gateway);

            await this.getMyAllpoints()
        }
    },
    methods: {
        logout() {
            window.userSignOut();
            window.location.href = '/';
        },
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
        hamburger() {
            if (this.hamburgerIsOpen) {
                document.getElementsByClassName('hamburger')[0].classList.remove('is-active')
                document.getElementById('home-menu').style.transform = 'translateY(-100%)'
                this.hamburgerIsOpen = false
            } else {
                document.getElementsByClassName('hamburger')[0].classList.add('is-active')
                document.getElementById('home-menu').style.transform = 'translateY(0px)'
                this.hamburgerIsOpen = true
            }
        },
        homeRedirect() {
            window.location.href = '/'
        },
        openUserMenu() {

            var menuDesktop = document.getElementById('home-user-menu-desktop')
            var menuMobile = document.getElementById('home-menu')

            if (window.screen.width > 1000) {
                menuDesktop.classList.contains('desktop-menu-open') ? menuDesktop.classList.remove('desktop-menu-open') : menuDesktop.classList.add('desktop-menu-open')
            } else {
                if (this.userMenuIsOpen) {
                    menuMobile.style.transform = 'translateY(-100%)'
                    this.userMenuIsOpen = false
                } else {
                    menuMobile.style.transform = 'translateY(0%)'
                    this.userMenuIsOpen = true
                }
            }
        }
    },
    template: /*html*/ `
<!-- Header-Card -->
<section id="header-card-body">
    <img class="header-card-logo" @click="homeRedirect" src="/_assets/_icons/gooders-logo.svg" alt="">
    <ul v-if="!is_secure" v-show="is_logged">
        <li><a href="/?hoteis">HOTÉIS</a></li>
        <li><a href="https://www.viajanet.com.br/passagens-aereas?utm_source=allpoints_hotels&utm_medium=newslleter&utm_content=passagensaereas">VOOS</a></li>
        <li><a href="https://www.rentcars.com/pt-br/?utm_source=allpoints_hotels&utm_medium=newslleter">ALUGUEL DE CARROS</a></li>
        <li><a href="/?bus">ÔNIBUS</a></li>
        <!-- <li><a href="">SEGUROS</a></li> -->
    </ul>
    <section class="header-card-user-region" v-if="!is_secure" v-show="is_logged">
        <img src="/_assets/_icons/allpoints-icon-pink.svg" alt="">
        <section class="header-card-saldo">
            <p class="header-card-saldo-value" v-if="balance?.available">{{balance.available}}</p>
            <p class="header-card-saldo-value" v-else>0,00</p>
            <p class="header-card-saldo-subtitle">Allpoints</p>
        </section>
        <section class="header-card-avatar-container">
            <a style="cursor: pointer;" @click="openUserMenu">
                <img width="40px" height="40px" src="/_assets/_imgs/avatar-placeholder.png" alt="">
            </a>
        </section>
        <a href="/checkout" v-show="this.subscriber" style="width: 100%;">
            <button type="button" class="header-button">assine allpoints</button>
        </a>
    </section>
    <section class="header-card-user-region" v-show="!is_logged && !is_empty">
        <ul>
            <!-- <li><a>PARA EMPRESAS</a></li> -->
            <li><a href="/login">JÁ TENHO CONTA</a></li>
        </ul>
        <a id="header-card-user-profile" href="/create-profile/">
            <button type="button" class="header-button-cadastrar">crie sua conta grátis</button>
        </a>
        <a class="header-card-button">
            <img src="/_assets/_icons/lang-br.svg" alt="">
        </a>
        <div class="header-card-hamburger">
            <button @click="hamburger()" class="hamburger hamburger--collapse" type="button">
                <span class="hamburger-box">
                    <span class="hamburger-inner"></span>
                </span>
            </button>
        </div>
    </section>
    <section class="header-secure" v-show="is_secure">
        <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M19.25 10.5H18.125V7.125C18.125 3.23438 14.8906 0 11 0C7.0625 0 3.875 3.23438 3.875 7.125V10.5H2.75C1.48438 10.5 0.5 11.5312 0.5 12.75V21.75C0.5 23.0156 1.48438 24 2.75 24H19.25C20.4688 24 21.5 23.0156 21.5 21.75V12.75C21.5 11.5312 20.4688 10.5 19.25 10.5ZM14.375 10.5H7.625V7.125C7.625 5.29688 9.125 3.75 11 3.75C12.8281 3.75 14.375 5.29688 14.375 7.125V10.5Z"
                fill="#EC0080" />
        </svg>
        <p>COMPRA SEGURA</p>
    </section>
</section>
`,
})