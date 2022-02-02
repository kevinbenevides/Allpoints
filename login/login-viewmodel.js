import { UserService } from '/_models/user/user-service.js';
import { Utils } from '/utils/utils.js'
import { Environment } from '/_models/enviroment.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'

var utils = new Utils();
var env = new Environment();
var userIdentity = new UserService(env.URIs().identity);
var userService = new UserService(env.URIs().gateway);
var subscriptionService = new SubscriptionService(env.URIs().gateway);

var loginVue = new Vue({
    el: "#login",
    data() {
        return {
            user: {
                email: "",
                phone: "",
                cpf: "",
                password: ""
            },

            accessKey: '',
            params: [],
            securityCode: '',
            errorMessage: '',

            param: {
                appId: "",
                redirectUrl: "",
                state: ''
            },

            chooseAcess: true,
            forgotPassword: false,
            accessCode: false,
            renderPassword: false,
            selectedMethod: null,

            code: {
                one: null,
                two: null,
                three: null,
                four: null,
                five: null
            },

            restorePassword: {
                canRestore: false,
                currentPassword: '',
                newPassword: ''
            },

            cpfValid: false,

            isEmail: false,
            isCpf: false,
            isPhone: false,

            emailSplit: '',
            phoneSplit: '',

            loading: false,

            loadingForm: false,

            timeExpire: '',

            typeAccess: '',
            subscription: false,
            codeId: null,
            validCode: null,

            exists: null,
            showTokenModal: false,
            showsuccess: false,
            showerro: false,

            channel_value: null,
            channel: null,

            telCode: '55',
            urlQuery: null,
            interval: null

        }
    },
    mounted() {
        this.urlQuery = window.location.href.split('?')[1];

        var url = window.location.href;

        if (url.includes("?") == true) {
            this.params = url.split('?')[1].split("&")
        }

        if (localStorage.getItem('expired-token')) {
            this.showTokenModal = true
        }

        var inputs = document.getElementsByClassName('cpfCelEmail')

        for (const item of inputs) {

            item.addEventListener('input', async function (e) {
                var regExp = /[a-zA-Z]/g;

                if (!regExp.test(e.target.value)) {
                    if (e.target.value.length <= 14 && e.target.value.length != 0) {
                        loginVue.isPhone = true;
                        loginVue.isCpf = false;
                        loginVue.isEmail = false;
                        console.log('phone', this.isPhone)

                        if (e.target.value.length == 14 || e.target.value.length == 11) {
                            var cpf = e.target.value.replace(/[\(\)\.\s-]+/g, '')

                            loginVue.cpfValid = utils.cpfValidation(cpf);

                            if (loginVue.cpfValid == true) {
                                loginVue.isCpf = true;
                                loginVue.isPhone = false;
                                loginVue.isEmail = false
                                console.log('cpf', this.isCpf)

                                var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
                                var mask = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '-' + x[4];
                                e.target.value = await mask;
                                loginVue.accessKey = await mask;
                            }
                        } else {
                            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : '(' + x[1] + ')' + x[2] + '-' + x[3];
                        }

                    }
                } else {
                    loginVue.isPhone = false;
                    var emailValid = utils.emailValidation(loginVue.accessKey);

                    if (emailValid) {
                        loginVue.isEmail = true;
                        loginVue.isCpf = false;
                    }
                }
            })
        }

        for (var item of this.params) {
            if (item.includes("app_id") == true) {
                this.param.appId = item.split("=")[1]
            }
            if (item.includes("redirect_uri") == true) {
                this.param.redirectUrl = item.split("=")[1]
            }
            if (item.includes("state") == true) {
                this.param.state = item.split("=")[1]
            }
        }

    },
    methods: {
        async login() {
            if (this.accessKey != "" && this.user.password != "") {

                if (this.isEmail) {
                    this.typeAccess = 'email'
                    this.user.email = this.accessKey.toLowerCase().trim()
                } else if (this.isPhone) {
                    this.user.phone = this.telCode + this.accessKey.trim().replace(/[\(\)\.\s-]+/g, '')
                    this.typeAccess = 'phone'
                } else if (this.isCpf) {
                    this.user.cpf = this.accessKey.trim().replace(/\D/g, '');
                    this.typeAccess = 'cpf'

                }

                this.loadingForm = true;

                var response = await userIdentity.login(this.user, this.typeAccess);


                if (response.access_token != undefined) {
                    var responseMe = await userService.meInfo(response.access_token)

                    env.SetLocalStorage("token", response.access_token);
                    env.SetLocalStorage("user", responseMe, true);
                    await this.getMySubscription(response.access_token);
                    this.loadingForm = false;

                    if (this.param.appId == "8453233387443368") {
                        window.location.href = this.param.redirectUrl + "?access_token=" + response.access_token + "&state=" + this.param.state
                    }
                    else {
                        if (this.urlQuery == 'checkout') {
                            window.location.href = "/checkout"
                        }else{
                            window.location.href = "/"
                        }
                    }

                } else {
                    this.errorMessage = 'Credenciais incorretas.'
                    this.user.password = null
                    this.loadingForm = false;
                }
            } else {
                this.errorMessage = 'Preencha todos os campos'
                this.loadingForm = false;
            }
        },

        closeTokenModal() {
            localStorage.removeItem('expired-token')
            this.showTokenModal = false
        },

        async changeStep(item) {
            switch (item) {
                case 'forgotPassword':
                    this.errorMessage = null;
                    this.forgotPassword = true
                    this.renderPassword = false
                    this.accessCode = false
                    this.chooseAcess = false
                    this.selectedMethod = ''

                    if (this.isCpf == true) {
                        this.accessKey = ''
                        this.isCpf = false;
                    }
                    break;

                case 'accessCode':
                    if (this.isEmail && this.emailValidation(this.accessKey) == 'valid') {
                        this.loadingForm = true;
                        await this.emailExists(this.accessKey)

                        if (this.exists == true) {
                            this.user.email = this.accessKey;
                            await this.hideEmail(this.user.email)
                            this.channel_value = this.user.email
                            this.channel = 'email'
                            this.errorMessage = ''
                            this.selectedMethod = 'mail'
                            this.sendCode()

                            this.loadingForm = false;

                            this.accessCode = true
                            this.forgotPassword = false
                        }
                        else {
                            this.errorMessage = 'Esse E-mail não foi cadastrado. Por favor, digite um cadastro existente'
                        }
                    }
                    else if (this.isPhone) {
                        this.loadingForm = true;
                        var phone = this.telCode + this.accessKey
                        await this.phoneExists(phone)

                        if (this.exists == true) {
                            this.user.phone = phone;
                            await this.hidePhone(this.user.phone)
                            this.selectedMethod = 'phone'
                            var phoneNumber = this.user.phone.replace(/[\(\)\.\s-]+/g, '')

                            this.channel_value = phoneNumber
                            this.channel = 'sms'
                            this.sendCode()

                            this.errorMessage = ''
                            this.loadingForm = false;
                            this.accessCode = true
                            this.forgotPassword = false
                        }
                        else {
                            this.errorMessage = 'Esse Telefone não foi cadastrado. Por favor, digite um cadastro existente'
                        }
                    }
                    else {
                        this.errorMessage = 'Digite uma chave de acesso válida'
                    }
                    this.loadingForm = false;
                    break;

                case 'restore':
                    this.codeVerify();
                    break;

                default:
                    break;
            }
        },

        stepBack() {
            if (this.chooseAcess) {
                window.userSignOut();
                window.location.href = '/'
            }
            if (this.renderPassword && !this.forgotPassword) {
                this.chooseAcess = true
                this.forgotPassword = false
                this.renderPassword = false
                this.errorMessage = null
            }
            if (this.forgotPassword) {
                this.forgotPassword = false
                this.renderPassword = true
                this.errorMessage = null
                this.errorMessage = null
            }
            if (this.accessCode) {
                this.selectedMethod = ''
                this.forgotPassword = true
                this.accessCode = false
                this.errorMessage = null
            }
            if (this.restorePassword.canRestore) {
                this.accessCode = true
                this.restorePassword.canRestore = false
                this.errorMessage = null
            }
        },

        copiedCode(code) {
            if (code.length > 4) {
                var splited = code.split('');
                this.code['one'] = splited[0]
                this.code['two'] = splited[1]
                this.code['three'] = splited[2]
                this.code['four'] = splited[3]
                this.code['five'] = splited[4]
            }
        },

        async alternate(key, index) {
            if (index == 4) {
                if (this.code[key].length > 0) {
                    this.code[key] = ''
                }
            }

            if (event.target.previousElementSibling && event.key == "Backspace" && event.target.value.length == 0) {
                if (this.code[key] == null) {
                    event.target.previousElementSibling.value = '';
                    this.code[Object.keys(this.code)[index - 1]] = null;
                    event.target.previousElementSibling.focus();
                }

                this.code[key] = null;
                return;
            }

            if (event.target.value.length > 0) {
                let item = this.code[Object.keys(this.code)[index]];

                this.code[Object.keys(this.code)[index]] = item[0];
                event.target.value = item[0];

                if (event.target.nextElementSibling) {
                    event.target.nextElementSibling.focus();
                }
                return;
            }
        },

        async sendCode() {
            clearInterval(this.interval)
            this.counterDown();
            await this.codeGenerator(this.channel_value, this.channel);
        },

        async codeGenerator(value, type) {
            var bodyPost = {
                "channel": type,
                "channel_value": value,
                "name": '-'
            }

            this.code.one = null
            this.code.two = null
            this.code.three = null
            this.code.four = null
            this.code.five = null

            var response = await userService.codeChangePassword(bodyPost);

            this.codeId = response.id
        },

        getUserTypeCode() {
            return this.code.one.toString() + this.code.two.toString() + this.code.three.toString() + this.code.four.toString() + this.code.five.toString();
        },

        async codeVerify() {
            this.loadingForm = true;

            if (this.code.one == null || this.code.two == null || this.code.three == null || this.code.four == null || this.code.five == null) {
                this.errorMessage = 'Preencha o campo com o código'
            } else {
                var code = this.getUserTypeCode();

                if (await userService.isCodeValid(this.isEmail ? "email" : "sms", this.codeId, code, "id")) {
                    this.validCode = code
                    this.loadingForm = false;
                    this.restorePassword.canRestore = true;
                    this.accessCode = false
                } else {
                    this.errorMessage = 'Código inválido'
                }
            }
            this.loadingForm = false;
        },

        async verifyAccess() {
            var passwordValid = utils.passwordValidation(this.restorePassword.newPassword);

            if (passwordValid == true) {
                this.changePassword();
            } else {
                if (passwordValid == 'falsePasswordLength') {
                    this.errorMessage = 'Senha deve ter no mínimo 8 dígitos'
                } else if (passwordValid == 'falseNumber') {
                    this.errorMessage = 'Senha deve conter pelo menos um número.'
                } else if (passwordValid == 'falseLetter') {
                    this.errorMessage = 'Senha deve conter pelo menos uma letra.'
                }
            }
        },

        closeModal() {
            this.showsuccess = false
            this.showerro = false
        },

        async changePassword() {
            if (this.restorePassword.currentPassword == this.restorePassword.newPassword) {
                if (this.codeId) {
                    var bodyPut = {
                        "code": this.validCode,
                        "password": this.restorePassword.newPassword,
                        "channel": this.isEmail == true ? "email" : "sms",
                        "channel_value": this.isEmail == true ? this.user.email : this.user.phone,
                        "id": this.codeId,
                        "name": "-"
                    }

                    this.loadingForm = true;
                    var response = await userService.changePassword(bodyPut);
                    console.log(response)

                    if (response.ok == true) {
                        this.showsuccess = true;
                        this.loadingForm = false;
                    }
                    else {
                        this.showerro = true;
                        this.loadingForm = false;
                    }
                }
                else {
                    this.showerro = true;
                    this.loadingForm = false;
                }
            } else {
                this.errorMessage = 'Senhas devem ser iguais';
            }
            this.errorMessage = ''
        },

        goToLogin() {
            this.renderPassword = true
            this.closeModal();
            this.restorePassword.canRestore = false
            this.forgotPassword = false
            this.accessKey = null;
        },

        async checkAcessKey() {
            this.loadingForm = true;
            if (this.accessKey != '') {
                if (this.isEmail) {
                    await this.emailExists(this.accessKey)

                    if (this.exists == true) {
                        this.user.email = this.accessKey;
                        await this.hideEmail(this.user.email)
                        this.errorMessage = ''
                        this.loadingForm = false;
                        this.renderPassword = true;
                        this.chooseAcess = false;
                    }
                    else {
                        this.errorMessage = 'Esse E-mail não foi cadastrado. Por favor, cadastre-se antes de logar'
                    }
                }
                else if (this.isCpf) {
                    await this.cpfExists(this.accessKey)

                    if (this.exists == true) {
                        this.user.cpf = this.accessKey;
                        this.errorMessage = ''
                        this.loadingForm = false;
                        this.renderPassword = true;
                        this.chooseAcess = false;
                    }
                    else {
                        this.errorMessage = 'Esse CPF não foi cadastrado. Por favor, cadastre-se antes de logar'
                    }
                }
                else if (this.isPhone && this.accessKey.length > 10) {
                    var phone = this.telCode + this.accessKey
                    await this.phoneExists(phone)

                    if (this.exists == true) {
                        this.user.phone = phone;
                        await this.hidePhone(this.user.phone)
                        this.errorMessage = ''
                        this.loadingForm = false;
                        this.renderPassword = true;
                        this.chooseAcess = false;
                    }
                    else {
                        this.errorMessage = 'Esse Telefone não foi cadastrado. Por favor, cadastre-se antes de logar'
                    }
                }
                else {
                    this.errorMessage = 'Digite uma chave de acesso válida'
                }

            } else {
                this.errorMessage = 'Preencha o campo de chave de acesso'
            }
            this.loadingForm = false;
        },

        async hideEmail(email) {
            var separado = email.split('@');
            var finalNome = separado[0].substr(separado[0].length - 2);

            this.emailSplit = finalNome + '@' + separado[1];
            return this.emailSplit;
        },

        async hidePhone(phone) {
            var endPhone = phone.substr(phone.length - 4);

            this.phoneSplit = endPhone;
            return this.phoneSplit;
        },

        counterDown() {
            var dt = new Date();
            dt.setMinutes(dt.getMinutes() + 15);

            this.interval = setInterval(() => {
                this.timeExpire = utils.countDown(dt.getTime());
            }, 1000);
        },

        async getMySubscription(token) {
            var response = await subscriptionService.mySubscription(token);

            if (response) {
                this.subscription = true;
            } else {
                this.subscription = false;
            }
        },

        emailValidation(email) {
            var index_email = email.substring(0, email.indexOf("@"));
            var dominio = email.substring(email.indexOf("@") + 1, email.length);
            if ((index_email.length >= 1) &&
                (dominio.length >= 3) &&
                (index_email.search("@") == -1) &&
                (dominio.search("@") == -1) &&
                (index_email.search(" ") == -1) &&
                (dominio.search(" ") == -1) &&
                (dominio.search(".") != -1) &&
                (dominio.indexOf(".") >= 1) &&
                (dominio.lastIndexOf(".") < dominio.length - 1)) {
                return 'valid'
            } else {
                return 'invalid'
            }
        },

        async emailExists(email) {
            var response = await userService.validateEmail(email);

            if (response == 1) {
                this.exists = true;
            } else {
                this.exists = false;
            }
        },

        async cpfExists(cpf) {
            var cpfNumbers = cpf.replace(/\D/g, '');
            var response = await userService.validateCPF(cpfNumbers);

            if (response == 0) {
                this.exists = false;
            } else {
                this.exists = true;
            }
        },

        async phoneExists(phone) {
            var phoneNumbers = phone.replace(/[\(\)\.\s-]+/g, '')
            var validPhone

            if (phoneNumbers.indexOf('55') == 0) {
                validPhone = phoneNumbers
            } else {
                validPhone = '55' + phoneNumbers
            }

            var response = await userService.validatePhone(validPhone);

            if (response == 0) {
                this.exists = false;
            } else {
                this.exists = true;
            }
        },
        onChangeValue: function (value) {
            this.telCode = value
        }
    }
})

window.loginVue = loginVue;

export { loginVue };