<template>
  <button class="anadir btn btn-warning" style="width:200px;" @click="cerrarSession()">Cerrar Session</button>
  <button class="anadir btn btn-primary" style="width:200px;" @click="volver()">Volver al Tutor</button>
  <div id="tabla-usuarios">
    <h1>Alumno: {{ alumno.nombre }} <span v-for="apellido in alumno.apellidos" :key="apellido">&nbsp;{{apellido}}</span></h1>
    <h1>Clase: {{ clase }}</h1>
    <h4>Sus Entrevistas</h4>
    <div>
      <span v-if="anadiendoEntrevista === false">
        <button class="anadir btn btn-primary" style="width:200px;" @click="anadirEntrevista()">➕ Añadir Entrevista</button>
      </span>
      <div v-else class="center">
        <div class="column">
          <input name="titulo" type="hidden" v-model="entrevista._id"/>
          <label class="column">
            <span>Titulo</span>
            <input name="titulo" type="text" v-model="entrevista.titulo"/>
          </label>
          <label class="column">
            <span>Nota</span>
            <input name="nota" type="text" v-model="entrevista.nota"/>
          </label>
          <label class="column">
            <span>Fecha</span>
            <input name="fecha" type="date" v-model="entrevista.fecha"/>
          </label>
          <div>
            <button class="anadir btn btn-danger" style="width:200px;" @click="anadirEntrevista(false)">Cancelar</button>
            <button class="anadir btn btn-primary" style="width:200px;" @click="anadirEntrevista(true)">Guardar</button>
          </div>
        </div>
      </div>
    </div>
    <div class="overflow">
      <table class="table">
          <thead>
            <tr>
              <th>Tutor</th>
              <th>Titulo</th>
              <th>Nota</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entrevista in entrevistas" :key="entrevista._id">
              <td>{{entrevista.tutorNombre}}</td>
              <td>{{entrevista.titulo}}</td>
              <td>{{entrevista.nota}}</td>
              <td>{{entrevista.fechaMostrar}}</td>
              <td>
                <button class="btn btn-primary" @click="editarEntrevista(entrevista)">🖊 Editar</button>
                <button class="btn btn-danger" @click="borrarEntrevista(entrevista._id)">❌ Eliminar</button>
              </td>
            </tr>
          </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerAlumno',
  data: () => {
	const tutor = JSON.parse(localStorage.getItem('usuario'));
    return { 
      clase: "",
      alumno: {},
      entrevistas: [],
      tutor: tutor,
      anadiendoEntrevista: false,
      entrevista: {}
    }
  },
  mounted() {
    this.buscarAlumno(this.$route.params.id);
    this.buscarEntrevistas(this.$route.params.id, this.tutor._id);
  },
  methods: {
    async cerrarSession(){
      localStorage.removeItem('usuario')
      localStorage.removeItem('token')
      return window.location = '/';
    },
    async volver(){
      return window.location = '/usuario'
    },
    async buscarAlumno(oid){
      const [alumno] = await fetch(`${process.env.VUE_APP_URL_BACK}/alumnos/${oid}`,{
            method: 'GET',
            redirect: 'follow'
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));

      await this.buscaClase(alumno.clase)
      this.alumno = alumno
    },
    async buscaClase(oid){

      const [clase] = await fetch(`${process.env.VUE_APP_URL_BACK}/clase/${oid}`,{
            method: 'GET',
            redirect: 'follow'
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));

      this.clase = clase.nombre
    },
    async buscarEntrevistas(alumnoOid, tutorOid){

      const entrevistas = await fetch(`${process.env.VUE_APP_URL_BACK}/entrevistas`,{
        method: 'GET',
        redirect: 'follow',
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));
      
      const entrevistasDelTutor = entrevistas.filter(_entrevista => _entrevista.alumno === alumnoOid && _entrevista.tutor === tutorOid);
      entrevistasDelTutor.forEach(entrevista=> { 
        const fecha = new Date(entrevista.fecha)
        let mes = fecha.getMonth()+1
        mes = ((mes+'').length === 1 ? '0'+mes : mes)
        let dia = fecha.getDate()
        dia = ((dia+'').length === 1 ? '0'+dia : dia)

        entrevista.tutorNombre = (this.tutor.nombre + ' '+ this.tutor.apellidos[0] + ' ' + this.tutor.apellidos[1])
        entrevista.fechaMostrar = dia+'-'+mes+'-'+fecha.getFullYear()
      });
      this.entrevistas = entrevistasDelTutor
    },
    async anadirEntrevista(guardar){
      this.anadiendoEntrevista = !this.anadiendoEntrevista
      if ( guardar === true ){

        if (!this.entrevista.titulo || !this.entrevista.fecha) return alert('Debe rellenar toda la informacion')

        const fecha = new Date(this.entrevista.fecha)
        let mes = fecha.getMonth()+1
        mes = ((mes+'').length === 1 ? '0'+mes : mes)
        let dia = fecha.getDate()
        dia = ((dia+'').length === 1 ? '0'+dia : dia)

        const body = {
          ...this.entrevista,
          fecha: fecha.getFullYear()+'-'+mes+'-'+dia+'T00:00:00.000Z',
          tutor: this.tutor._id,
          alumno: this.alumno._id
        }

        if ( this.entrevista._id ){
          
          const editado = await fetch(`${process.env.VUE_APP_URL_BACK}/entrevistas/${this.entrevista._id}`,{
            method: 'PUT',
            redirect: 'follow',
            body: JSON.stringify({...body}),
            headers:{
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
            }
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));

          if ( editado ) return window.location.reload()
          
        } else {
          const creado = await fetch(`${process.env.VUE_APP_URL_BACK}/entrevistas`,{
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({...body}),
            headers:{
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
            }
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));

          if ( creado ) return window.location.reload()

        }
        
      }
      this.entrevista = {}
    },
    async editarEntrevista(entrevista){
      this.anadiendoEntrevista = true
      const fecha = new Date(entrevista.fecha)
      let mes = fecha.getMonth()+1
      mes = ((mes+'').length === 1 ? '0'+mes : mes)
      let dia = fecha.getDate()
      dia = ((dia+'').length === 1 ? '0'+dia : dia)

      this.entrevista = {...entrevista, fecha: fecha.getFullYear()+'-'+mes+'-'+dia}
    },
    async borrarEntrevista(entrevistaOid){
      const eliminado = await fetch(`${process.env.VUE_APP_URL_BACK}/entrevistas/${entrevistaOid}`,{
            method: 'DELETE',
            redirect: 'follow',
            headers:{
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
            }
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));

          if ( eliminado ) return window.location.reload()
    }
  }

}
</script>


<style>
.anadir{
  margin-bottom: 10px;
}
.center{
  display: flex;
  justify-content: center;
}
.column{
  display:flex;
  flex-direction: column;
}

.overflow{
  overflow-x: scroll;
}

</style>