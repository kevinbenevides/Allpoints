Vue.component("modal-erro", {
  name: "modal-erro",
  props: ['showerro', 'text', 'buttontext'],
  data() {
      return {
        showModalErro: this.showerro,
      }
  },
  mounthed() {
  },
  methods: {

  },
  template: /*html*/ `
  <!-- Modal de Erro -->
  <section class="modal-erro" v-show='this.showerro'>
   <div class="modal-container" @click="$emit('close')">
     <div class="modal-content modal-size">
       <div class="modal-close">
         <i class="far fa-times" @click="$emit('close')"></i>
       </div>

       <p class="modal-title">Oops! Algo deu Errado.</p>
      <p class="modal-subtitle">{{text}}</p>
      <i class="fas fa-exclamation-circle error-mark"></i>

       <button class="modal-pink-button" @click="$emit('button')">{{buttontext}}</button>
     </div>
   </div>
 </section>
`,
})