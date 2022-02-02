Vue.component("form-accesskey",{
    name:"form-accesskey",
    props: ['accesskey'],
    data(){
        return{
            teste: this.accesskey
        }
    },
    mounthed(){
    },
    methods:{    
        handleInput(e){
            this.$emit('input', this.teste);
        }
    },
    template: /*html*/ `
    <section class="new-create-user-content">
        <div class="new-create-user-item">
            <h1>Comece a planejar sua próxima<br> 
                viagem agora mesmo!</h1>
            <form class="new-create-user-form">
                <label>Utilize seu CPF, e-mail ou celular como chave de acesso.
                    <input type="email" @input="handleInput" :value="teste" placeholder="Chave de Acesso" name="email">
                </label>

                <button clas s="sign-your-plan-btn-pink btn-home" type="button" @click="$emit('next')">Avançar</button>
                <b>ou</b>
                <button class="btn-home form-social-buttons form-social-buttons-face" type="submit" @click="$emit('face')"><img src="/_assets/_icons/facebook-icon.svg"> Continuar com o Facebook</button>
                <button class="btn-home form-social-buttons form-social-buttons-google" type="submit" @click="$emit('google')"><img src="/_assets/_icons/google-icon.svg"> Continuar com o Google</button>
            </form>
        </div>
    </section>
    `,
})