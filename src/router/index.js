import { createWebHistory, createRouter } from "vue-router";
import LoginRegistro from "../components/LoginRegistro.vue";
import BienvenidoUsuario from "../components/BienvenidoUsuario.vue";
import BienvenidoSecretaria from "../components/BienvenidoSecretaria.vue";
import BienvenidoAdministrador from "../components/BienvenidoAdministrador.vue";
import VerAlumno from "../components/VerAlumno.vue";


// import About from "@/views/About.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginRegistro,
  },
  {
    path: "/usuario",
    name: "Usuario",
    component: BienvenidoUsuario
  },
  {
    path: "/alumno/:id",
    name: "Alumno",
    component: VerAlumno
  },
  {
    path: "/secretaria",
    name: "Secretaria",
    component: BienvenidoSecretaria
  },
  {
    path: "/administrador",
    name: "Administrador",
    component: BienvenidoAdministrador
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to,from,next)=>{

  if ( to.name === 'Login' || to.name === "Registro" ) return next();
  else if( !localStorage.getItem('token') ) return window.location = "/";
  else return next()

})

export default router;