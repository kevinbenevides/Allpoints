Vue.component("code-verify", {
    name: "code-verify",
    props: ['time', 'error', 'loading'],
    data() {
        return {
            code: [],
            object: {
                one: null,
                two: null,
                three: null,
                four: null,
                five: null
            }
        }
    },
    mounted() {

    },
    methods: {
        action() {
            this.object.one = this.code[0]
            this.object.two = this.code[1]
            this.object.three = this.code[2]
            this.object.four = this.code[3]
            this.object.five = this.code[4]
            this.$emit('code', this.object)
            this.$emit('event')
        },
        sendCode() {
            this.$emit('sendcode')
        },
        value(x) {
            if (this.code[x] != '') {
                if (x !== 4) {
                    document.getElementsByClassName('authenticate-number')[x + 1].focus()
                }
            }
            else {
                if (x !== 0) {
                    document.getElementsByClassName('authenticate-number')[x - 1].focus()
                }
            }
        },
        async pasteCode() {
            var text = await navigator.clipboard.readText();
            for (let i = 0; i < 5; i++) {
                this.code[i] = text[i];
            }
            document.getElementById('verify-button').focus()
        }
    },
    template: /*html*/ `
<section style="display: flex; flex-direction: column;">
    <h1 style="margin-bottom: 0;">Confirme seu e-mail</h1>
    <p class="text-code-authenticate">Insira o código de 5 números que enviamos para o <b>e-mail com
            final ...</b> <span class="form-code-expire"> Expira em
            {{this.time}}</span></p>
    <form class="form-user-form form-code-authenticate">
        <input @keyup="value(0)" onfocus="this.select()" @paste="pasteCode" v-model="code[0]" class="authenticate-number" type="text" pattern="\d*" maxlength="1">
        <input @keyup="value(1)" onfocus="this.select()" @paste="pasteCode" v-model="code[1]" class="authenticate-number" type="text" pattern="\d*" maxlength="1">
        <input @keyup="value(2)" onfocus="this.select()" @paste="pasteCode" v-model="code[2]" class="authenticate-number" type="text" pattern="\d*" maxlength="1">
        <input @keyup="value(3)" onfocus="this.select()" @paste="pasteCode" v-model="code[3]" class="authenticate-number" type="text" pattern="\d*" maxlength="1">
        <input @keyup="value(4)" onfocus="this.select()" @paste="pasteCode" v-model="code[4]" class="authenticate-number" type="text" pattern="\d*" maxlength="1">
    </form>
    <p class="erro-message">{{this.error}}</p>
    <span class='span-nao-recebeu'>Não recebeu? <p class="text-pink" @click="sendCode" style="cursor: pointer;">Enviar
            Novamente</p></span>

    <div style="margin-left: auto; margin-right: auto;" class="lds-ellipsis" v-show="loading">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <button id="verify-button" class="sign-your-plan-btn-pink btn-home" type="button" @click="action()">Avançar</button>
</section>
`,
})