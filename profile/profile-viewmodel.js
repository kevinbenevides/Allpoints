import { WebkitInputRangeFillLower } from '/webkit-input-range-fill-lower-master/dist/webkit-input-range-fill-lower.js';
import { BalanceService } from '/_models/balance/balance-service.js';
import { TransactionsService } from '/_models/transactions/transactions-service.js'
import { BookingsService } from '/_models/bookings/bookings-service.js'
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { NotificationService } from '/_models/notifications/notification-service.js'
import { Auth } from '/_models/auth/auth.js'
import { Environment } from '/_models/enviroment.js';
import { UserService } from '/_models/user/user-service.js'

var env = new Environment();
var balanceService = new BalanceService(env.URIs().gateway);
var transactionsService = new TransactionsService(env.URIs().gateway);
var bookingsService = new BookingsService(env.URIs().gateway);
var subscriptionService = new SubscriptionService(env.URIs().gateway);
var notificationsService = new NotificationService(env.URIs().gateway);
var userService = new UserService(env.URIs().gateway);
var authService = new Auth(env.URIs().gateway);

var profileVue = new Vue({
    el: '#profile',
    data() {
        return {
            showContent: 'extract',
            isOpen: false,
            isDotsOpen: false,
            showModalAssinatura: false,
            showModalPlano: false,
            showModalIntro1: false,
            showModalIntro2: false,
            showModalSuporte: false,
            expireAllpoints: '',
            extract: true,
            travels: false,
            notifications: false,
            subscription: false,
            visa: false,
            rangeError: '',

            logged: true,
            loading: true,
            loadingFilter: false,
            token: '',
            user: {},

            date: {
                inicio: null,
                fim: null
            },
            title: '',
            isFiltered: false,

            balance: {},
            transactions: [],
            bookings: [],

            subscriptions: {},
            plan: {},
            noSubscription: false,
            planValue: null,
            errorPlan: null,

            showsuccess: false,
            showerro: false,
            showdaterange: false,

            notificationList: [],
            notificationsSeen: [],
            notificationsNotSeen: [],
            notificationDate: null,
            seen: null,

            earn: [],
            burn: [],
            earnTotal: 0,
            burnTotal: 0,
            motivoCancelamento: '',

            paymentMethod: null,
            paymentFlag: null,

            period: null
        }
    },
    async mounted() {

        this.loading = true;

        var dataAtual = new Date();
        this.date.fim = dataAtual.toISOString().split('T')[0]
        dataAtual.setMonth(dataAtual.getMonth() - 3);
        this.date.inicio = dataAtual.toISOString().split('T')[0]
        this.user = env.GetLocalStorage('user', true);
        this.token = env.GetLocalStorage("token")
        await authService.authVerify(this.token);
        this.expireAllpoints = await userService.expireAllpoints(this.token)

        const queryString = window.location.search;
        switch (queryString) {
            case '?viagens':
                this.extract = false
                this.travels = true
                this.notifications = false
                this.subscription = false
                this.visa = false;
                this.showContent = 'travels'
                break;
            case '?notificacao':
                this.extract = false
                this.travels = false
                this.notifications = true
                this.subscription = false
                this.visa = false;
                this.showContent = 'notifications'
                break;
            case '?assinatura':
                this.extract = false
                this.travels = false
                this.notifications = false
                this.subscription = true
                this.visa = false;
                this.showContent = 'subscription'
                break;
            case '?visa':
                this.extract = false
                this.travels = false
                this.notifications = false
                this.subscription = false
                this.visa = true;
                this.showContent = 'visa'
                this.loadChart()
                break;
            default:

                break;
        }

        if (this.user != null) {
            this.logged = true;
        }
        else {
            window.location.href = '/login'
            localStorage.setItem('expired-token', true)
        }

        await this.getMyAllpoints();

        await this.getMyTransactions();

        await this.getTotalEarnBurn();

        if (this.user.newMember == undefined || this.user.newMember == false) {
            await this.newMemberVerify();
        }

        await this.getMySubscription();

        this.loading = false

        await this.getMyPaymentMethod();

        await this.getNotifications();
        // this.showModalIntro1 = true

        await this.getMyBookings();

        this.handleSlider();

        this.user
    },
    methods: {
        async getMyPaymentMethod() {
            if (this.noSubscription == false) {
                var pmm = await subscriptionService.myPaymentMethod(this.token);
                this.paymentMethod = pmm;

                if (this.paymentMethod.data.brand.toLowerCase() == 'visa') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/visa.svg'
                }
                else if (this.paymentMethod.data.brand.toLowerCase() == 'amex') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/amex.svg'
                }
                else if (this.paymentMethod.data.brand.toLowerCase() == 'diners') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/diners.svg'
                }
                else if (this.paymentMethod.data.brand.toLowerCase() == 'elo') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/elo.svg'
                }
                else if (this.paymentMethod.data.brand.toLowerCase() == 'hipercard') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/hipercard.svg'
                }
                else if (this.paymentMethod.data.brand.toLowerCase() == 'mastercard') {
                    this.paymentFlag = '/_assets/_icons/icons-pagamento/mastercard.svg'
                }
            }
        },

        async getMyAllpoints() {
            this.balance = await balanceService.myBalance(this.token)
            
            if (this.balance != 204) {
                var balance = this.balance.available.toString()
                var oldBalance = this.balance?.oldAvailable?.toString()

                if (balance.includes('.')) {
                    this.balance.available = balance.replace('.', ',')
                } else {
                    this.balance.available = this.balance.available + ',00'
                }

                if (oldBalance != undefined && oldBalance.includes('.')) {
                    this.balance.oldAvailable = oldBalance.replace('.', ',')
                } 
                else if(oldBalance == undefined){
                    this.balance.oldAvailable = '0,00'
                }
                else {
                    this.balance.oldAvailable = this.balance.oldAvailable + ',00'
                }
            }
        },

        nextIntro() {
            this.showModalIntro1 = false
            this.showModalIntro2 = true
        },

        async getMyTransactions() {
            this.transactions = await transactionsService.myTransactions(this.token);

            this.transactions = this.transactions.sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time))


            this.transactions.map(x => {
                x.value = x.value.toFixed(2).toString().replace(".", ",");

                if (x.label == 'credit') {
                    x.type = 'Acúmulo'
                    this.earn.push(x)
                }
                else {
                    x.type = 'Resgate'
                    this.burn.push(x)
                }
            });

            this.loadingFilter = false
        },

        async getMyTransactionsFiltered() {
            this.loadingFilter = true
            this.transactions = await transactionsService.filterExtratoDate(this.token, this.date.inicio, this.date.fim, this.title)

            this.transactions = this.transactions.sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time))

            this.transactions.map(x => {
                x.value = x.value.toFixed(2).toString().replace(".", ",");

                if (x.label == 'credit') {
                    x.type = 'Acúmulo'
                    this.earn.push(x)
                }
                else {
                    x.type = 'Resgate'
                    this.burn.push(x)
                }
            });

            this.loadingFilter = false

        },

        dateRange(startDate, endDate) {
            var start = startDate.split('-');
            var end = endDate.split('-');
            var startYear = parseInt(start[0]);
            var endYear = parseInt(end[0]);
            var dates = [];

            for (var i = startYear; i <= endYear; i++) {
                var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
                var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
                for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                    var month = j + 1;
                    var displayMonth = month < 10 ? '0' + month : month;
                    dates.push([i, displayMonth, '01'].join('-'));
                }
            }
            return dates;
        },


        async getMyBookings() {
            this.bookings = await bookingsService.myBookings(this.token);

            if (this.bookings) {
                this.bookings.map(x => {
                    x.checkIn = this.dateFormat(x.checkIn, 'dd/mm');
                    x.checkOut = this.dateFormat(x.checkOut, 'dd/mm');

                    if (x.accumulatedPoints) {
                        x.accumulatedPoints = x.accumulatedPoints.replace('.', ',');
                    }
                })
            }
        },

        async getMySubscription() {
            var result = await subscriptionService.mySubscription(this.token);

            if (result) {
                this.subscriptions = result.subscription;
                this.plan = result.plan;
            }
            else {
                this.noSubscription = true;
            }
        },

        async changeSubscription() {
            var body = {
                value: this.planValue
            }

            var response = await subscriptionService.changeSubscription(body, this.subscriptions.id, this.token);

            if (response.status == 200) {
                await this.getMySubscription();
                this.showModalPlano = false
                // TODO: send email
            } else {
                this.errorPlan = 'Ocorreu um erro, tente novamente mais tarde'
            }
        },

        async cancelSubscription() {
            var response = await subscriptionService.cancelSubscription(this.token, this.motivoCancelamento, this.subscriptions.id);

            if (response.status == 200) {
                await this.getMySubscription();
                this.showModalAssinatura = false;
                this.showsuccess = true;
            } else {
                this.showModalAssinatura = false;
                this.showerro = true;
            }
        },

        async getNotifications() {
            this.notificationList = await notificationsService.myNotifications(this.token);

            for (let i = 0; i < this.notificationList.length; i++) {
                if (this.notificationList[i].seen == true) {
                    this.notificationsSeen.push(this.notificationList[i])
                } else {
                    this.notificationsNotSeen.push(this.notificationList[i]);
                }
            }
        },

        async notificationSeen(id) {
            var response = await notificationsService.notificationSeen(id, this.token);
            console.log(response)
        },

        notificationsDate(ct) {
            var today = new Date()
            var past = new Date(ct);
            const diff = today.getTime() - past.getTime();

            const days = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
            const months = Math.floor(days / 30);
            const years = Math.floor(months / 12);

            if (years > 1) {
                return years + ' anos';
            } else if (years == 1) {
                return years + ' ano';
            } else if (months > 1) {
                return months + ' meses';
            } else if (months == 1) {
                return months + ' mês';
            } else if (days >= 7 && days < 14) {
                return '1 semana'
            } else if (days >= 14 && days < 21) {
                return '2 semanas'
            } else if (days >= 21 && days < 28) {
                return '3 semanas'
            } else if (days >= 28 && days < 30) {
                return '4 semanas'
            } else if (days > 1) {
                return days + ' dias';
            } else if (days == 1) {
                return days + ' dia';
            } else {
                return 'algum tempo';
            }
        },

        getTotalEarnBurn() {
            for (let i = 0; i < this.earn.length; i++) {
                var newEarnValue = this.earn[i].value.replace(",", ".")
                this.earnTotal += parseFloat(newEarnValue)
            }

            this.earnTotal = this.earnTotal.toFixed(2).toString().replace('.', ',');

            for (let i = 0; i < this.burn.length; i++) {
                var newBurnValue = this.burn[i].value.replace(",", ".")
                this.burnTotal += parseFloat(newBurnValue)
            }

            this.burnTotal = this.burnTotal.toFixed(2).toString().replace('.', ',');
        },

        openFiltro: function () {
            this.isOpen = !this.isOpen
            console.log(this.isOpen)
        },
        openDropdownDots: function () {
            this.isDotsOpen = !this.isDotsOpen
        },
        menuclick: function (val) {
            this.showContent = val;

            switch (this.showContent) {
                case 'extract':
                    this.extract = true;
                    this.travels = false;
                    this.notifications = false;
                    this.subscription = false;
                    this.visa = false;
                    break;

                case 'travels':
                    this.extract = false
                    this.travels = true;
                    this.notifications = false;
                    this.subscription = false;
                    this.visa = false;

                    break;

                case 'notifications':
                    this.extract = false
                    this.travels = false;
                    this.notifications = true;
                    this.subscription = false;
                    this.visa = false;

                    break;

                case 'subscription':
                    this.extract = false
                    this.travels = false;
                    this.notifications = false;
                    this.subscription = true;
                    this.visa = false;

                    break;
                case 'visa':
                    this.extract = false
                    this.travels = false;
                    this.notifications = false;
                    this.subscription = false;
                    this.visa = true;
                    this.loadChart()
                    break;
                default:
                    break;
            }
        },

        // format date applying locale timezone conversion. Use for datetimeoffset
        dateFormat(date, opition = null) {
            var newDate = new Date(date)
            var dateFormated = newDate.toLocaleDateString('pt-BR')

            if (opition == null) {
                return dateFormated
            } else if (opition == 'dd/mm') {
                var date = dateFormated.split('/')

                return date[0] + '/' + date[1]
            }
        },

        // format date without applying locale timezone conversion. Use for fixed dates
        simpleDateFormat(date) {
            // console.log(date);
            // console.log(new Date(date));

            return new Date(date).toLocaleDateString('pt-BR', {
                timeZone: 'UTC'
            });
        },

        loadChart() {
            // var options = {
            //   series: [44, 55, 41, 17],
            //   chart: {
            //     type: 'donut',
            //   },
            //   labels: [`R$ ${5000} Saldo anterior`, `R$ ${610} utilizados`, `R$ ${400} Saldo atual de Cashback`, `R$ ${300} Reais a serem resgatados`],
            //   plotOptions: {
            //     pie: {
            //       startAngle: 0,
            //       endAngle: 360,
            //       expandOnClick: true,
            //       offsetX: 0,
            //       offsetY: 0,
            //       customScale: 1,
            //       dataLabels: {
            //         offset: 0,
            //         minAngleToShowLabel: 10
            //       },
            //       donut: {
            //         size: '65%',
            //         background: 'transparent',
            //         labels: {
            //           show: false,
            //         }
            //       },
            //     }
            //   }

            // };

            // var chart = new ApexCharts(document.querySelector("#chart"), options);
            // chart.render();
        },

        handleSlider() {
            var slider = document.getElementById("myRange");
            var output = document.getElementById("planValue");
            var allpointValue = document.getElementById("allpointValue");
            output.innerHTML = slider.value;
            allpointValue.innerHTML = parseFloat(slider.value) + parseFloat(slider.value) / 10;

            slider.oninput = function () {
                output.innerHTML = this.value;
                allpointValue.innerHTML = parseFloat(this.value) + parseFloat(this.value) / 10;
            }

            this.planValue = slider.value;
        },

        closeModal() {
            this.showsuccess = false;
            this.showerro = false;
        },

        redirectAssinatura() {
            window.location.href = '/checkout'
        },

        async filtrar() {
            this.rangeError = ''
            if ((this.date.inicio && this.date.inicio != "") || (this.date.fim && this.date.fim != "")) {
                this.showdaterange = true
                this.isFiltered = true
                if (this.dateRange(this.date.inicio, this.date.fim).length > 12) {
                    this.rangeError = 'Intervalo não pode ser superior a 12 meses.'
                } else {
                    await this.getMyTransactionsFiltered()
                }
            }
            if (this.title != '') {
                this.showdaterange = false
                this.isFiltered = true
                await this.getMyTransactionsFiltered()
            }

        },

        async filterByPeriod(period){

            var today = new Date()

            switch (period) {
                case 3:
                    today.setMonth(today.getMonth() - 3);
                    this.date.inicio = today.toISOString().split('T')[0]
                    this.period = 3;
                    break;
                    
                case 6:
                    today.setMonth(today.getMonth() - 6);
                    this.date.inicio = today.toISOString().split('T')[0]
                    this.period = 6;
                    break

                case 12:
                    today.setFullYear(today.getFullYear() - 1);
                    this.date.inicio = today.toISOString().split('T')[0]
                    this.period = 12;
                    break
                        
                default:
                    break;
            }

            this.showdaterange = true
            this.isFiltered = true;
            await this.getMyTransactionsFiltered()
        },

        async removeFiltro() {
            this.rangeError = ''
            var dataAtual = new Date();
            this.date.fim = dataAtual.toISOString().split('T')[0]
            dataAtual.setMonth(dataAtual.getMonth() - 3);
            this.date.inicio = dataAtual.toISOString().split('T')[0]
            this.title = "";
            this.loadingFilter = true;
            this.isFiltered = false;
            this.showdaterange = false;
            this.period = null;
            await this.getMyTransactions();
        },

        async newMemberVerify() {
            var dateEspecify = new Date("2021-07-03")

            if (this.transactions.length > 0) {
                this.transactions.filter(x => {
                    var dateTransact = new Date(x.update_time);

                    if (dateEspecify >= dateTransact) {
                        this.showModalIntro1 = true
                        return this.user.newMember = false
                    }
                })
            }
            
            this.user.newMember = true;
            
            var payload = { newMember: this.user.newMember }
            var response = await userService.changeUser(payload, this.token);

            env.SetLocalStorage('user', this.user, true)
        }
    }
})

new WebkitInputRangeFillLower({
    selectors: ['myRange'],
    gradient: 'rgb(236, 0, 128), rgb(236, 0, 128)'
});