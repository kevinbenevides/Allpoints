import { UserService } from '/_models/user/user-service.js';
import {Utils} from '/utils/utils.js'
import { SubscriptionService } from '/_models/subscription/subscription-service.js'
import { Environment } from '/_models/enviroment.js';

var env = new Environment();
var utils = new Utils();
var subscriptionService = new SubscriptionService(env.URIs().gateway);
var userService = new UserService(env.URIs().gateway);

var changePassowrdVue = new Vue({
    el:'#changePassword',
    data(){
      return{
        selectedMethod: null,
        steps:{
          accessType: true,
          accessKey: false,
          newPassword: false,
        },

        securityCode: '',
        errorMessage: '',
        code:{
          one: null,
          two: null,
          three: null,
          four: null,
          five:null
        },

        token: '',
        user: {},

        emailSplit: '',
        phoneSplit: '',
        timeExpire: '',

        showsuccess: false,

        loading: false,
        loadingForm: false,

        subscriptions : {},
        noSubscription: false,

        newPassword: null,
        newPasswordRepeat: null,
        validCode: null,
        codeId: null,
        interval: null,
      }
    },
    async mounted() {
      this.loading = true;

      this.user = env.GetLocalStorage('user', true);
      this.token = env.GetLocalStorage("token");

      this.hideEmail(this.user.email);
      this.hidePhone(this.user.phone);

      await this.getMySubscription();

      this.loading = false;
    },
    methods:{

      async getMySubscription(){
        var response = await subscriptionService.mySubscription(this.token);
  
        if (response) {
          this.subscriptions = response.subscription;
        }
        else {
          this.noSubscription = true;
        }

      },

      changeStep: function (item, type){
        switch (item) {
          case 'accessKey':
            if (type == 'phone') {
              this.selectedMethod = 'phone'
              this.sendCode()
            }
            if(type == 'mail'){
              this.selectedMethod = 'mail'
              this.sendCode()
            }

            this.steps.accessKey = true
            this.steps.accessType = false
            break;
            
          case 'newPassword':
            this.codeVerify();
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
            case 'accessType':
                this.steps.accessType = true
                this.steps.accessKey = false
                this.steps.newPassword = false
                break;
            case 'accessKey':
                this.steps.accessType = false
                this.steps.accessKey = true
                this.steps.newPassword = false
                break;
            default:
                break;
        }
      },

      async sendCode(){
        clearInterval(this.interval)
        this.counterDown();

        if (this.selectedMethod == 'phone') {
          this.codeGenerator('sms', this.user.phone)
        }
        if (this.selectedMethod == 'mail') {
          this.codeGenerator('email', this.user.email)
        }
      },

      copiedCode(code){
        if(code.length > 4){
            var splited = code.split('');
            this.code['one'] = splited[0]
            this.code['two'] = splited[1]
            this.code['three'] = splited[2]
            this.code['four'] = splited[3]
            this.code['five'] = splited[4]
        }
      },

      async alternate(key, index) {
        if(index == 4){
            if(this.code[key].length > 0){
                this.code[key] =  ''
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

      async codeGenerator(type, value)
      {
        var bodyPost = {
          "channel_value": value,
          "channel": type,
          "name": this.user.name
        }

        var response = await userService.codeChangePassword(bodyPost); 

        this.codeId = response.id
      },

      getUserTypeCode()
      {
          return this.code.one.toString() + this.code.two.toString() + this.code.three.toString() + this.code.four.toString() + this.code.five.toString();
      },

      async codeVerify(){  
        this.loadingForm = true;
        if (this.code.one == null || this.code.two == null || this.code.three == null || this.code.four == null || this.code.five == null)
        {
            this.errorMessage = 'Preencha o campo com o código'
            this.loadingForm = false;
        }
        else
        {
            var code = this.getUserTypeCode();
            if (await userService.isCodeValid(this.selectedMethod == 'mail' ? "email" : "sms", this.codeId, code, "id"))
            {
                this.errorMessage = ''
                this.validCode = code
                this.steps.newPassword = true
                this.steps.accessKey = false
                this.loadingForm = false;
            }
            else
            {
                this.errorMessage = 'Código inválido'
                this.loadingForm = false;
            }
        }
      },

      closeModal(){
        this.showsuccess = false;
        this.showerro = false;
      },

      redirectProfile() {
        window.location.href = '/profile'
      },

      async hideEmail(email){
        var separado = email.split('@');
        var finalNome = separado[0].substr(separado[0].length - 2);

        this.emailSplit = finalNome + '@' + separado[1];
        return this.emailSplit;
      },

      async hidePhone(phone){
        this.phoneSplit = phone.substr(phone.length - 4);

          return this.phoneSplit;
      },

      counterDown(){
        var dt = new Date();
        dt.setMinutes( dt.getMinutes() + 15 );
        
        this.interval = setInterval(() => {
            this.timeExpire = utils.countDown(dt.getTime());
        }, 1000);
      },

      async changePassword(){
        if (this.newPassword !== this.newPasswordRepeat) {
          this.errorMessage = 'Os campos devem ser iguais'
        }
        else{
          if (this.codeId) {
            this.loadingForm = true
            var bodyPut = {
              "code": this.validCode,
              "password": this.newPassword,
              "id": this.codeId,
              "channel_value": this.selectedMethod == 'phone'? this.user.phone : this.user.email,
              "channel":  this.selectedMethod == 'phone'? 'sms' : 'email',
              "name": this.user.name
            }

            var response = await userService.changePassword(bodyPut);
            console.log(response)

            if (response.ok == true) {
              this.loadingForm = false
              this.showsuccess = true
            }
            else{
              this.loadingForm = false
              this.showerro = true
            }
          }
          else{
            this.showerro = true
          }
        }
      }

    } 
})