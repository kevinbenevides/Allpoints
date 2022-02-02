import { Auth } from '/_models/auth/auth.js'
import { Utils } from '/utils/utils.js'
import { UserService } from '/_models/user/user-service.js'
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { EmailService } from '/_models/emails/emails-service.js';
import { Environment } from '/_models/enviroment.js';


var env = new Environment();
var utils = new Utils();
var subscriptionService = new SubscriptionService(env.URIs().gateway);
var emailService = new EmailService(env.URIs().messages, env.Keys().messages)
var userService = new UserService(env.URIs().gateway);
var authService = new Auth(env.URIs().gateway);

var editVue = new Vue({
  el: '#edit',
  data()
  {
    return {
      erro: true,
      erroMessage: '',
      erroName: false,

      steps: {
        updateData: true,
        accessKey: false,
      },

      newData: {
        name: null,
        phone: null,
        email: null
      },

      securityCode: '',

      code: {
        one: null,
        two: null,
        three: null,
        four: null,
        five: null
      },

      token: '',
      user: {},

      emailSplit: '',
      phoneSplit: '',
      timeExpire: '',

      showsuccess: false,
      showerro: false,

      showModalExcluir: false,
      showModalConfirmarExcluir: false,

      variavelAlterada: '',

      loading: false,
      loadingForm: false,

      isEmail: true,

      subscriptions: {},
      noSubscription: false,
      interval: null,

      telCode: null,

      channel: null,
      channel_value: null,
    }
  },
  async mounted()
  {
    this.loading = true;

    this.user = env.GetLocalStorage('user', true);
    this.newData = env.GetLocalStorage('user', true);
    this.token = env.GetLocalStorage("token");

    await authService.authVerify(this.token);

    var phone_code = [this.user.phone.slice(0 , 2), this.user.phone.slice(2) ]

    this.telCode = phone_code[0]
    this.user.phone = phone_code[1]
    this.newData.phone = phone_code[1]

    await this.getMySubscription();

    this.loading = false;

  },
  methods: {

    async getMySubscription() {
      var result = await subscriptionService.mySubscription(this.token);

      if (result) {
          this.subscriptions = result.subscription;
      }
      else {
          this.noSubscription = true;
      }
    },

    changeStep: function (item, type)
    {
      switch (item)
      {
        case 'chooseAccess':
          if (this.newData.name === this.user.name && this.newData.phone.replace(/[^0-9]+/g,'') === this.user.phone && this.newData.email === this.user.email)
          {
            this.erroMessage = 'Altere seus dados para prosseguir'
          } 
          else {
            this.erroMessage = ''
            this.steps.chooseAccess = true
            this.steps.updateData = false
            if (this.newData.name != this.user.name)
            {
              this.variavelAlterada = 'Nome'
            }
            if (this.newData.phone.replace(/[^0-9]+/g,'') != this.user.phone)
            {
              this.variavelAlterada = 'Telefone'
            }
            if (this.newData.email != this.user.email)
            {
              this.variavelAlterada = 'Email'
            }
            this.hidePhone(this.newData.phone);
            this.hideEmail(this.newData.email);
          }
          break;
        case 'accessKey':
          if (type == 'phone') {
            this.channel = 'sms'
            this.channel_value = this.telCode + this.newData.phone.replace(/[^0-9]+/g,'')
          } else {
            this.channel = 'email'
            this.channel_value = this.newData.email
          }
            this.sendEmail()
            this.steps.chooseAccess = false;
            this.steps.accessKey = true
          break;

        case 'updateData':
          this.steps.accessKey = false
          this.steps.updateData = true
          break;

        default:
          break;
      }
    },
    stepBack(page) {
      switch (page) {
        case 'profile':
          window.location.href = '/profile'
          break;
        case 'updateData':
          this.steps.updateData = true
          this.steps.chooseAccess = false
          break;
        case 'chooseAccess':
          this.steps.chooseAccess = true
          this.steps.accessKey = false
          break;
        default:
          break;
      }
    },

    async sendEmail()
    {
      clearInterval(this.interval)
      this.counterDown();
      await this.codeGenerator(this.channel_value, this.channel);
    },

    async postEmail(templateId, templateData)
    {
      var payload = {
        "from": "malu@allpoints.club",
        "from_name": "Malu",
        "to": this.newData.email,
        "template_data": templateData
      }

      var response = await emailService.postEmail(templateId, payload)
    },

    codeInput(value){
      this.code = value
  },

    copiedCode(code)
    {
      if (code.length > 4)
      {
        var splited = code.split('');
        this.code['one'] = splited[0]
        this.code['two'] = splited[1]
        this.code['three'] = splited[2]
        this.code['four'] = splited[3]
        this.code['five'] = splited[4]
      }
    },

    async alternate(key, index)
    {
      if (index == 4)
      {
        if (this.code[key].length > 0)
        {
          this.code[key] = ''
        }
      }

      if (event.target.previousElementSibling && event.key == "Backspace" && event.target.value.length == 0)
      {
        if (this.code[key] == null)
        {
          event.target.previousElementSibling.value = '';
          this.code[Object.keys(this.code)[index - 1]] = null;
          event.target.previousElementSibling.focus();
        }

        this.code[key] = null;
        return;
      }

      if (event.target.value.length > 0)
      {
        let item = this.code[Object.keys(this.code)[index]];

        this.code[Object.keys(this.code)[index]] = item[0];
        event.target.value = item[0];

        if (event.target.nextElementSibling)
        {
          event.target.nextElementSibling.focus();
        }
        return;
      }
    },

    async codeGenerator(value, type) {
      if (type == 'sms') {
          await userService.requestPhoneConfirmation(value);
      }
      else{
          await userService.requestEmailConfirmation(value);
      }
    },

    async codeVerify()
    {
      this.loadingForm = true;
      if (this.code.one == null || this.code.two == null || this.code.three == null || this.code.four == null || this.code.five == null)
      {
        this.erroMessage = 'Preencha o campo com o código'
        this.loadingForm = false;
      }
      else
      {
        var code = this.code.one.toString() + this.code.two.toString() + this.code.three.toString() + this.code.four.toString() + this.code.five.toString()

        if (await userService.isCodeValid(this.channel, this.channel_value, code, "id"))
        {
          var payload = {
            name: this.newData.name,
            phone: this.telCode + this.newData.phone.replace(/[^0-9]+/g,''),
            email: this.newData.email
          }
          if (this.emailValidation(this.newData.email) == 'valid' && this.nameValidation(this.newData.name) == 'valid')
          {
            var responseUser = await userService.changeUser(payload, this.token);

            if (responseUser.status === 200)
            {
              this.user.name = payload.name
              this.user.phone = payload.phone
              this.user.email = payload.email
              env.SetLocalStorage('user', this.user, true);
              // localStorage.setItem('user-live', JSON.stringify(this.user))
              this.loadingForm = false;
              this.showsuccess = true
            }
            else
            {
              this.loadingForm = false;
              this.showerro = true
            }
          }
          else
          {
            if (this.nameValidation(this.newData.name) == 'invalid')
            {
              this.erroName = true
              this.errorMessage = 'Digite um nome válido'
              this.loadingForm = false;
            }
            else if (this.emailValidation(this.newData.email) == 'invalid')
            {
              this.erroName = true
              this.errorMessage = 'Digite um email válido'
              this.loadingForm = false;
            }
          }
        } else
        {
          this.erroMessage = 'Código inválido'
          this.loadingForm = false;
        }
      }
    },

    closeModal()
    {
      this.showsuccess = false;
      this.showerro = false;
    },

    async hideEmail(email)
    {
      var separado = email.split('@');
      var finalNome = separado[0].substr(separado[0].length - 2);

      this.emailSplit = finalNome + '@' + separado[1];

      return this.emailSplit;
    },
    async hidePhone(phone){
      this.phoneSplit = phone.substr(phone.length - 4);

        return this.phoneSplit;
    },

    counterDown()
    {
      var dt = new Date();
      dt.setMinutes(dt.getMinutes() + 15);

      this.interval = setInterval(() =>
      {
        this.timeExpire = utils.countDown(dt.getTime());
      }, 1000);

    },

    emailValidation(email)
    {
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
        (dominio.lastIndexOf(".") < dominio.length - 1))
      {
        return 'valid'
      } else
      {
        return 'invalid'
      }
    },

    nameValidation(name)
    {
      return "valid";

      var padrao = /^[A-zÀ-ú '´]+$/;
      var nome_separado = name.split(' ');
      var retorno;

      if (nome_separado.length == 1)
      {
        return 'invalid'
      }
      else
      {
        for (let i = 0; i < nome_separado.length; i++)
        {
          const valida_nome = nome_separado[i].match(padrao);
          if (nome_separado[i].length > 1 && valida_nome !== null)
          {
            retorno = 'valid'
          }
          else
          {
            retorno = 'invalid'
            break
          }
        }
        if (retorno == 'valid')
        {
          return 'valid'
        }
        else
        {
          return 'invalid'
        }
      }
    },

    redirectProfile()
    {
      window.location.href = '/profile'
    },

    onChangeValue: function(value){
      this.telCode = value
    }
  }
})