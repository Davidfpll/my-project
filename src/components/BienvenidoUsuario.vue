<template>
  <div id="tabla-usuarios">
    <button class="anadir btn btn-warning" style="width:200px;" @click="cerrarSession()">Cerrar Session</button>
    <h1>Bienvenido {{ usuario.nombre }}<span v-for="apellido in usuario.apellidos" :key="apellido">&nbsp;{{apellido}}</span></h1>
    <h4>Tus Alumnos</h4>
    <div class="overflow">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Clase</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in alumnos" :key="alumno._id">
            <td>{{alumno.nombre}}</td>
            <td>{{alumno.clase.nombre}}</td>
            <td>
              <button class="btn btn-primary" @click="verAlumno(alumno._id)">👁‍🗨 Ver Alumno</button>
              <button class="btn btn-danger" @click="eliminarAlumno(alumno._id, alumno.clase)">❌ Eliminar Alumno</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BienvenidoUsuario',
  data: () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return { 
      usuario,
      alumnos: []
    }
  },
  beforeMount(){
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // if ( usuario.rol === "tutor" ) window.location = '/usuario';
    if ( usuario.rol === "secretaria" ) window.location = '/secretaria';
    if ( usuario.rol === "administrador" ) window.location = '/administrador';
  },
  mounted() {
      this.buscarAlumnos(this.usuario.clases);
  },
  methods: {
    async cerrarSession(){
		localStorage.removeItem('usuario')
		localStorage.removeItem('token')
		return window.location = '/'
	},
    async buscarAlumnos(clases){

      for await(const claseOid of clases) {

        const [clase] = await fetch(`${process.env.VUE_APP_URL_BACK}/clase/${claseOid}`,{
          method: 'GET',
          redirect: 'follow'
        })
        .then(response => response.text())
        .then(JSON.parse)
        .catch(error => console.log('error', error));

        const alumnos = await this.buscarAlumnosPorClase(claseOid);

        this.alumnos = alumnos.map(alumno => { 
          alumno.clase = clase;
          return alumno
        });
      }
      
    },
    async buscarAlumnosPorClase(clase){
      const alumnos = await fetch(`${process.env.VUE_APP_URL_BACK}/alumnos`,{
        method: 'GET',
        redirect: 'follow'
      })
      .then(response => response.text())
			.then(JSON.parse)
      .catch(error => console.log('error', error));

      return alumnos.filter(_alumno => _alumno.clase === clase)
    },
    verAlumno(oid){
      return window.location = `/alumno/${oid}`;
    },
    async eliminarAlumno(alumnoOid, clase){
      const nuevosAlumnos = clase.alumnos.filter(_alumno => _alumno._id !== alumnoOid)
      const editado = await fetch(`${process.env.VUE_APP_URL_BACK}/clase/${clase._id}`,{
            method: 'PUT',
            redirect: 'follow',
            body: JSON.stringify({ alumnos: nuevosAlumnos }),
            headers:{
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
            }
          })
          .then(response => response.text())
          .then(JSON.parse)
          .catch(error => console.log('error', error));
      if ( editado ){
        const eliminado = await fetch(`${process.env.VUE_APP_URL_BACK}/alumnos/${alumnoOid}`,{
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

}
</script>


<style>
#tabla-usuarios{
  display: flex;
  flex-direction: column;
  justify-content:center;
}

#tabla-usuarios > table{
  border: solid 1px;
  align-self: center;
  width: 50vw;
}

.overflow{
  overflow-x: scroll;
}
</style>