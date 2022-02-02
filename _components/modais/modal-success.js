Vue.component("modal-sucesso", {
  name: "modal-sucesso",
  props: ['showsuccess', 'title', 'subtitle', 'buttontext'],
  data() {
      return {
        showModalSuccess: this.showsuccess,
      }
  },
  mounthed() {
  },
  methods: {

  },
  template: /*html*/ `
  <!-- Modal de sucesso -->
  <section class="modal-sucesso" v-show='this.showsuccess'>
   <div class="modal-container">
     <div class="modal-content modal-size">
       <div class="modal-close">
         <i class="far fa-times" @click="$emit('close')"></i>
       </div>

       <p class="modal-title">{{title}}</p>
       <p class="modal-subtitle">{{subtitle}}</p>
       <i class="fas fa-check-circle success-mark"></i>

       <button class="modal-pink-button" @click="$emit('button')">{{buttontext}}</button>
     </div>
   </div>
 </section>
`,
})