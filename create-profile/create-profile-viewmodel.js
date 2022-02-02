import { WebkitInputRangeFillLower } from '/webkit-input-range-fill-lower-master/dist/webkit-input-range-fill-lower.js';
import { UserService } from '/_models/user/user-service.js'
import { Utils } from '/utils/utils.js'
import { EmailService } from '/_models/emails/emails-service.js';
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { Environment } from '/_models/enviroment.js';

var env = new Environment();
var utils = new Utils();
var userIdentity = new UserService(env.URIs().identity);
// var userObjects = new UserService(env.URIs().objects);
var userService = new UserService(env.URIs().gateway);
var emailService = new EmailService(env.URIs().messages, env.Keys().messages)
var subscriptionService = new SubscriptionService(env.URIs().gateway)

var createUserVue = new Vue({
    el: "#createUser",
    data() {
        return {
            user: {
                email: "",
                password: "",
                name: "",
                phone: "",
                cpf: "",
                picture: "",
                accepted_receive_promotional_emails: false,
                terms_accepted: false,
                terms_version: '1.0.0'
            },
            pictureFile: null,
            logged: false,
            rewritePassword: '',
            errorMessage: '',
            accessKey: '',

            steps: {
                accessKey: true,
                password: false,
                emailConfirm: false,
                profile: false,
                card: false
            },
            securityCode: '',

            code: {
                one: null,
                two: null,
                three: null,
                four: null,
                five: null
            },
            rewrite_password: "",
            me: {},

            cpfValid: false,

            isEmail: false,
            isCpf: false,
            isPhone: false,

            loading: false,

            loadingForm: false,

            urlQuery: null,
            phoneSplit: '',
            emailSplit: '',

            showsuccess: false,
            showerro: false,
            timeExpire: '',

            creditCard: {
                number: '',
                verification_value: '',
                expiration: '',
                first_name: '',
                last_name: '',
                full_name: ''
            },
            cpf_cnpj: null,
            planValue: null,

            telCode: '55',

            interval: null,

            channel_value: null,
            channel: null,
        }
    },
    computed: {
        bandeira: function () {
            var cardnumber = this.creditCard.number.replace(/[^0-9]+/g, '');

            var cards = {
                elo: /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|^627780|^63(6297|6368|6369)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
                mastercard: /^((5(([1-2]|[4-5])[0-9]{8}|0((1|6)([0-9]{7}))|3(0(4((0|[2-9])[0-9]{5})|([0-3]|[5-9])[0-9]{6})|[1-9][0-9]{7})))|((508116)\\d{4,10})|((502121)\\d{4,10})|((589916)\\d{4,10})|(2[0-9]{15})|(67[0-9]{14})|(506387)\\d{4,10})/,
                diners: /(36[0-8][0-9]{3}|369[0-8][0-9]{2}|3699[0-8][0-9]|36999[0-9])/,
                hipercard: /^606282|^3841(?:[0|4|6]{1})0/,
                amex: /^3[47][0-9]{13}$/,
                visa: /^4[0-9]{15}$/,
            };

            for (var flag in cards) {
                if (cards[flag].test(cardnumber)) {
                    if (flag == 'visa') {
                        return '/_assets/_icons/icons-pagamento/visa.svg'
                    }
                    else if (flag == 'amex') {
                        return '/_assets/_icons/icons-pagamento/amex.svg'
                    }
                    else if (flag == 'diners') {
                        return '/_assets/_icons/icons-pagamento/diners.svg'
                    }
                    else if (flag == 'elo') {
                        return '/_assets/_icons/icons-pagamento/elo.svg'
                    }
                    else if (flag == 'hipercard') {
                        return '/_assets/_icons/icons-pagamento/hipercard.svg'
                    }
                    else if (flag == 'mastercard') {
                        return '/_assets/_icons/icons-pagamento/mastercard.svg'
                    }
                }
            }

            return '/_assets/_icons/icons-pagamento/padrao.svg'
        }
    },
    async mounted() {
        this.urlQuery = window.location.href.split('?')[1];

        console.log(this.urlQuery)

        if (this.urlQuery == 'subscription=true') {
            this.changeStep('card')
        }

        document.getElementById('cpfCelEmail').addEventListener('input', async function (e) {
            var regExp = /[a-zA-Z]/g;

            if (!regExp.test(e.target.value)) {
                if (e.target.value.length <= 14) {
                    createUserVue.isPhone = true;
                    createUserVue.isCpf = false;
                    createUserVue.isEmail = false;

                    if (e.target.value.length == 14 || e.target.value.length == 11) {
                        var cpf = e.target.value.replace(/[\(\)\.\s-]+/g, '')

                        createUserVue.cpfValid = utils.cpfValidation(cpf);

                        if (createUserVue.cpfValid == true) {
                            createUserVue.isCpf = true;
                            createUserVue.isPhone = false;
                            createUserVue.isEmail = false

                            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
                            var mask = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '-' + x[4];
                            e.target.value = await mask;
                            createUserVue.accessKey = await mask;
                        }
                    } else {
                        var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                        e.target.value = !x[2] ? x[1] : '(' + x[1] + ')' + x[2] + '-' + x[3];
                    }

                }
            } else {
                var emailValid = utils.emailValidation(createUserVue.accessKey);

                if (emailValid) {
                    createUserVue.isEmail = true;
                    createUserVue.isCpfSet = false;
                    createUserVue.isPhoneSet = false;
                }
            }

        });

        this.handleSlider();
    },
    methods: {
        async createUser() {
            this.loadingForm = true;
            if (this.urlQuery == 'subscription=false') {
                this.loadingForm = false;
                this.logged = true;
                this.changeStep('card');
            } else {
                if (
                    this.user.email != '' &&
                    this.user.password != '' &&
                    this.user.phone.length == 11 &&
                    utils.cpfValidation(this.user.cpf) &&
                    this.user.terms_accepted != false
                ) {


                    if (this.emailValidation(this.user.email) == 'valid' && this.nameValidation(this.user.name) == 'valid') {
                        var userLogin = {
                            email: this.user.email,
                            password: this.user.password
                        }

                        this.user.phone = this.telCode + this.user.phone

                        // // // 1º Passo - Cadastrar um usuário pelo email.
                        // var responseEmail = await this.createLoginEmail();

                        // // 2º Passo - Setar que o id do usuário é o id gerado no cadastro pelo email.
                        // this.user.id = responseEmail.id;

                        // // 3º Passo - Cadastrar um usuário pelo cpf.
                        // var responseCpf = await this.createLoginCpf();

                        // // 4º Passo - Cadastrar um usuário pelo Telefone.
                        // var responsePhone = await this.createLoginPhone();

                        // 5º Passo - Cadastrar um usuário com todos os dados.
                        !this.isCpf ? this.user.code = this.getUserTypeCode() : null;

                        this.removeAllMask();

                        if (this.isCpf) {
                            var responseUser = await userService.createUser(this.user, null, "cpf");
                        } else if (this.isEmail) {
                            var responseUser = await userService.createUser(this.user, null, "email");
                        } else if (this.isPhone) {
                            var responseUser = await userService.createUser(this.user, null, "phone");
                        }
                        // 6º Passo - Efetuar login com usuário cadastrado para autentica-lo na plataforma.
                        var responseLogin = await userIdentity.login(userLogin);

                        var responseMe = await userService.meInfo(responseLogin.access_token)

                        if (responseLogin.access_token != undefined) {
                            env.SetLocalStorage('token', responseLogin.access_token);
                            env.SetLocalStorage('user', responseUser, true);
                            localStorage.setItem('newUser', true)
                            this.loadingForm = false;

                            this.showsuccess = true;
                        } else {
                            this.loadingForm = false;
                            this.showerro = true;
                        }
                    } else {
                        if (this.nameValidation(this.user.name) == 'invalid') {
                            this.errorMessage = 'Digite um nome válido'
                        } else if (this.emailValidation(this.user.email) == 'invalid') {
                            this.errorMessage = 'Digite um email válido'
                        }
                    }
                } else {
                    this.errorMessage = 'Preencha Todos os Campos'
                }
                this.loadingForm = false;
            }
        },

        async createLoginEmail() {
            var bodyEmail = {
                user: this.user.email,
                password: this.user.password
            }

            var response = await userIdentity.createUser(bodyEmail, 'identity');

            return response;
        },

        async createLoginCpf() {
            var bodyCpf = {
                id: this.user.id,
                user: this.user.cpf,
                password: this.user.password
            }

            var response = await userIdentity.createUser(bodyCpf, 'identity');

            return response;
        },

        async createLoginPhone() {
            var bodyPhone = {
                id: this.user.id,
                user: this.telCode + this.user.phone,
                password: this.user.password
            };

            var response = await userIdentity.createUser(bodyPhone, 'identity');

            return response;
        },

        async getMeData() {
            var response = await userObjects.getMeData(this.userId)

            this.me = response;
            console.log(this.me);
        },

        stepBack(page) {
            switch (page) {
                case 'key':
                    window.location.href = '/'
                    break;
                case 'password':
                    this.steps.accessKey = true
                    this.steps.password = false
                    this.steps.emailConfirm = false
                    this.steps.profile = false
                    this.steps.card = false
                    break;
                case 'email':
                    this.steps.accessKey = false
                    this.steps.password = true
                    this.steps.emailConfirm = false
                    this.steps.profile = false
                    this.steps.card = false
                    break;
                case 'profile':
                    this.steps.accessKey = false
                    this.steps.password = false
                    this.steps.emailConfirm = false
                    this.steps.profile = false
                    this.steps.card = false
                    break;
                case 'card':
                    this.steps.accessKey = false
                    this.steps.password = false
                    this.steps.emailConfirm = false
                    this.steps.profile = true
                    this.steps.card = false
                    break;
                default:
                    break;
            }
        },

        removeAllMask() {
            this.user.phone = this.user.phone.replace(/[\(\)\.\s-]+/g, '');

            this.user.cpf = this.user.cpf.replace(/\D/g, '');
        },

        async changeStep(item) {
            switch (item) {
                case 'accessKey':
                    this.steps.accessKey = true;
                    break;
                case 'password':
                    this.errorMessage = ''
                    this.checkAcessKey()
                    break;
                case 'emailConfirm':
                    this.loadingForm = true;

                    if (this.isEmail == true) {
                        await this.hideEmail(this.user.email);
                        var passwordValid = utils.passwordValidation(this.user.password);
                        this.errorMessage = ''

                        if (passwordValid == true) {
                            this.passwordVerify();
                            this.channel_value = this.user.email
                            this.channel = 'email'
                            this.sendCode()
                            // this.codeGenerator()
                        } else {
                            if (passwordValid == 'falsePasswordLength') {
                                this.errorMessage = 'Senha deve ter no mínimo 8 dígitos'
                            } else if (passwordValid == 'falseNumber') {
                                this.errorMessage = 'Senha deve conter pelo menos um número.'
                            } else if (passwordValid == 'falseLetter') {
                                this.errorMessage = 'Senha deve conter pelo menos uma letra.'
                            }
                        }
                        this.loadingForm = false;
                    } else if (this.isPhone == true) {
                        await this.hidePhone(this.user.phone);

                        var passwordValid = utils.passwordValidation(this.user.password);
                        this.errorMessage = ''

                        if (passwordValid == true) {
                            this.passwordVerify();
                            this.channel_value = this.telCode + this.user.phone
                            this.channel_value = this.channel_value.replace(/[\(\)\.\s-]+/g, '')
                            this.channel = 'sms'
                            this.sendCode()
                            // this.codeGenerator()
                        } else {
                            if (passwordValid == 'falsePasswordLength') {
                                this.errorMessage = 'Senha deve ter no mínimo 8 dígitos'
                            } else if (passwordValid == 'falseNumber') {
                                this.errorMessage = 'Senha deve conter pelo menos um número.'
                            } else if (passwordValid == 'falseLetter') {
                                this.errorMessage = 'Senha deve conter pelo menos uma letra.'
                            }
                        }
                        this.loadingForm = false;
                    }

                    else {
                        this.errorMessage = ''
                        this.loadingForm = false;
                        this.steps.password = false
                        this.steps.profile = true
                    }
                    break;
                case 'profile':
                    this.codeVerify();
                    break;
                case 'card':
                    this.creditCard.full_name = this.user.name
                    this.cpf_cnpj = this.user.cpf
                    this.steps.accessKey = false
                    this.steps.password = false
                    this.steps.profile = false
                    this.steps.card = true
                    break;
            }
        },

        async passwordVerify() {
            if (this.user.password == this.rewritePassword) {
                this.steps.password = false;
                this.steps.emailConfirm = true;
            } else {
                this.errorMessage = 'Senhas devem ser iguais';
            }
        },

        async sendCode() {
            clearInterval(this.interval)
            this.counterDown();
            await this.codeGenerator(this.channel_value, this.channel);
        },

        codeInput(value) {
            this.code = value
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

            this.planValue = slider.value
        },

        async checkAcessKey() {
            this.loadingForm = true;
            if (this.accessKey != '') {
                if (this.isEmail) {
                    this.user.email = this.accessKey;
                    await this.emailExists(this.user.email);
                } else if (this.isCpf) {
                    this.user.cpf = this.accessKey;
                    await this.cpfExists(this.user.cpf);
                } else if (this.isPhone) {
                    this.user.phone = this.accessKey;
                    var full_phone = this.telCode + this.accessKey
                    await this.phoneExists(full_phone);
                } else {
                    return
                }

            } else {
                this.errorMessage = 'Preencha o campo de chave de acesso';
            }
            this.loadingForm = false;

        },

        async codeGenerator(value, type) {
            if (type == 'sms') {
                await userService.requestPhoneConfirmation(value);
            }
            else {
                await userService.requestEmailConfirmation(value);
            }
        },

        getUserTypeCode() {
            return this.code.one.toString() + this.code.two.toString() + this.code.three.toString() + this.code.four.toString() + this.code.five.toString();
        },

        async codeVerify() {
            this.loadingForm = true;

            if (this.code.one == null || this.code.two == null || this.code.three == null || this.code.four == null || this.code.five == null) {
                this.errorMessage = 'Preencha o campo com o código'
            }
            else {
                var code = this.getUserTypeCode();
                if (this.isEmail) {
                    if (await userService.isCodeValid("email", this.user.email, code, "id")) {
                        this.loadingForm = false;
                        this.steps.emailConfirm = false;
                        this.steps.profile = true;
                    } else {
                        this.errorMessage = 'Código inválido'
                    }
                }
                else {
                    var full_phone = this.telCode + this.user.phone
                    full_phone = full_phone.replace(/[\(\)\.\s-]+/g, '')
                    if (await userService.isCodeValid("sms", full_phone, code, "id")) {
                        this.loadingForm = false;
                        this.steps.emailConfirm = false;
                        this.steps.profile = true;
                    } else {
                        this.errorMessage = 'Código inválido'
                    }
                }

            }
            this.loadingForm = false;
        },

        async emailExists(email) {
            var response = await userService.validateEmail(email);

            if (response == 1) {
                this.errorMessage = 'Esse E-mail já foi cadastrado'
            } else {
                this.steps.accessKey = false;
                this.steps.password = true;
                this.errorMessage = ''
            }
        },

        async cpfExists(cpf) {
            var cpfNumbers = cpf.replace(/\D/g, '');
            var response = await userService.validateCPF(cpfNumbers);

            if (response == 0) {
                this.steps.accessKey = false;
                this.steps.password = true;
                this.errorMessage = ''
            } else {
                this.errorMessage = 'Esse CPF já foi cadastrado'
            }
        },

        async phoneExists(phone) {
            var phoneNumber = phone.replace(/[\(\)\.\s-]+/g, '')
            var response = await userService.validatePhone(phoneNumber);

            if (response == 0) {
                this.steps.accessKey = false;
                this.steps.password = true;
                this.errorMessage = ''
            } else {
                this.errorMessage = 'Esse Telefone já foi cadastrado'
            }
        },

        async postEmail(templateId, templateData) {
            var payload = {
                "from": "malu@allpoints.club",
                "from_name": "Malu",
                "to": this.user.email,
                "template_data": templateData
            }

            var response = await emailService.postEmail(templateId, payload)
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
        closeModal() {
            this.showsuccess = false;
            this.showerro = false;
        },
        changeLocation() {
            window.location.href = '/onboarding'
        },

        counterDown() {
            var dt = new Date();
            dt.setMinutes(dt.getMinutes() + 15);

            this.interval = setInterval(() => {
                this.timeExpire = utils.countDown(dt.getTime());
            }, 1000);
        },
        guidGenerator() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
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

        nameValidation(name) {
            var padrao = /^[A-zÀ-ú '´]+$/;
            var nome_separado = name.split(' ');
            var retorno;

            if (nome_separado.length == 1) {
                return 'invalid'
            } else {
                for (let i = 0; i < nome_separado.length; i++) {
                    const valida_nome = nome_separado[i].match(padrao);
                    if (nome_separado[i].length > 1 && valida_nome !== null) {
                        retorno = 'valid'
                    } else {
                        retorno = 'invalid'
                        break
                    }
                }
                if (retorno == 'valid') {
                    return 'valid'
                } else {
                    return 'invalid'
                }
            }
        },

        async createUserImg() {
            var fileName = this.pictureFile.replace(/^.*[\\\/]/, '');
            var extencion = fileName.split('.')[1]

            var response = await userService.postPicture(fileName, extencion);

            if (response.Name != '') {
                this.user.picture = response.Uri;
            }

            console.log(response)
        },

        createTokenPayment() {
            this.loadingForm = true
            var nameArray = this.creditCard.full_name.split(' ');
            var dateArray = this.creditCard.expiration.split('/')
            var cardNumber = this.creditCard.number.replace(/\s/g, '');
            var cnpj_cpf = this.cpf_cnpj.replace(/[^\d]+/g, '')

            console.log(nameArray[nameArray.length - 1])

            this.token = env.GetLocalStorage("token")

            Iugu.setAccountID("63089365B5374105A2CFCD82EBEACBE8");
            var cc = Iugu.CreditCard(cardNumber, dateArray[0], dateArray[1], nameArray[0], nameArray[nameArray.length - 1], this.creditCard.verification_value);

            Iugu.createPaymentToken(cc, async function (response) {
                if (response.errors) {
                    createUserVue.showerro = true
                } else {
                    var payload = {
                        plan: "21_" + createUserVue.planValue,
                        token: response.id,
                        name: createUserVue.creditCard.full_name,
                        legal_number: cnpj_cpf
                    }

                    var sub = await subscriptionService.createSubscription(env.GetLocalStorage("token"), payload);

                    if (sub.ok) {
                        that.loadingForm = false
                        createUserVue.showsuccess = true
                    }
                    else {
                        that.loadingForm = false
                        createUserVue.showerro = true;
                    }
                }
            })
        },
        onChangeValue: function (value) {
            this.telCode = value
        },
        redirectLogin() {
            if (this.urlQuery == 'subscription=false') {
                window.location.href = '/login/?checkout'
            } else {
                window.location.href = '/login'
            }
        }
    }
})

new WebkitInputRangeFillLower({
    selectors: ['myRange'],
    gradient: 'rgb(236, 0, 128), rgb(236, 0, 128)'
});

window.createUserVue = createUserVue;

export { createUserVue };