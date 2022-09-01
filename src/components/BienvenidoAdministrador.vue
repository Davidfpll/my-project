<template>
  <div id="tabla-administrador">
	<button class="anadir btn btn-warning" style="width:200px;" @click="cerrarSession()">Cerrar Session</button>
    <!-- <h1>Bienvenido {{ usuario.nombre }}<span v-for="apellido in usuario.apellidos" :key="apellido">&nbsp;{{apellido}}</span></h1> -->
    <h4>Profesores</h4>
	<div>
		<span v-if="anadiendoProfesor === false">
			<button class="anadir btn btn-primary" style="width:200px;" @click="anadirProfesor()">➕ Añadir Profesor</button>
		</span>
		<div v-else class="center">
			<div class="column">
				<input name="_id" type="hidden" v-model="profesor._id"/>
				<label class="column">
					<span>Usuario</span>
					<input name="usuario" type="text" v-model="profesor.usuario"/>
				</label>
				<input v-if="!!profesor._id === true" name="titulo" type="hidden" v-model="profesor.contrasena"/>
				<label v-else class="column">
					<span>Contrasena</span>
					<input name="titulo" type="text" v-model="profesor.contrasena"/>
				</label>
				<label class="column">
					<span>Nombre</span>
					<input name="nombre" type="text" v-model="profesor.nombre"/>
				</label>
				<label class="column">
					<span>Primer Apellido</span>
					<input name="apellidos[0]" type="text" v-model="profesor.apellidos[0]"/>
				</label>
				<label class="column">
					<span>Segundo Apellido</span>
					<input name="apellidos[1]" type="text" v-model="profesor.apellidos[1]"/>
				</label>
				<label class="column">
					<span>Clases</span>
					<select multiple v-model="profesor.clases">
						<option v-for="clase in this.clases" :key="clase._id" :value="clase._id">{{clase.nombre}}</option>
					</select>
				</label>
				<div>
					<button class="anadir btn btn-danger" style="width:200px;" @click="anadirProfesor(false)">Cancelar</button>
					<button class="anadir btn btn-primary" style="width:200px;" @click="anadirProfesor(true)">Guardar</button>
				</div>
			</div>
		</div>
	</div>
	<input type="file" @change="subirFoto" ref="file" style="display: none;" />
	<div class="overflow">
		<table class="table">
		<thead>
			<tr>
			<th>Usuario</th>
			<th>Foto</th>
			<th>Nombre</th>
			<th>Primer Apellido</th>
			<th>Segundo Apellido</th>
			<th>Clases</th>
			<th>Acciones</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="profesor in profesores" :key="profesor._id">
			<td>{{profesor.usuario}}</td>
			<td><img width="150" v-if="!!profesor.foto" :src="profesor.foto"></td>
			<td>{{profesor.nombre}}</td>
			<td>{{profesor.apellidos[0]}}</td>
			<td>{{profesor.apellidos[1]}}</td>
			<td><span v-for="clase in profesor.clases" :key="clase">{{this.clases.find(_clase => _clase._id === clase) && this.clases.find(_clase => _clase._id === clase).nombre}}<br/></span></td>
			<td>
				<button class="btn btn-primary" @click="editarProfesor({...profesor, apellidos: [...profesor.apellidos]})">🖊 Editar</button>
				<button class="btn btn-warning" @click="cambiarImagen(profesor._id)">📷 Foto</button>
				<button class="btn btn-danger" @click="eliminarProfesor(profesor._id)">❌ Eliminar</button>
			</td>
			</tr>
		</tbody>
		</table>
	</div>
	<h4>Clases</h4>
	<div>
		<span v-if="anadiendoClase === false">
			<button class="anadir btn btn-primary" style="width:200px;" @click="anadirClase()">➕ Añadir Clase</button>
		</span>
		<div v-else class="center">
			<div class="column">
				<input name="_id" type="hidden" v-model="clase._id"/>
				<label class="column">
					<span>Nombre</span>
					<input name="nombre" type="text" v-model="clase.nombre"/>
				</label>
				<label class="column">
				<span>Alumnos</span>
				<select multiple v-model="clase.alumnos">
					<option v-for="alumno in this.alumnos" :key="alumno._id" :value="alumno._id">{{alumno.nombre}} {{alumno.apellidos[0]}} {{alumno.apellidos[1]}}</option>
				</select>
			</label>
				<div>
					<button class="anadir btn btn-danger" style="width:200px;" @click="anadirClase(false)">Cancelar</button>
					<button class="anadir btn btn-primary" style="width:200px;" @click="anadirClase(true)">Guardar</button>
				</div>
			</div>
		</div>
	</div>
	<div class="overflow">
		<table class="table">
		<thead>
			<tr>
			<th>Nombre</th>
			<th>Alumnos</th>
			<th>Acciones</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="clase in clases" :key="clase._id">
			<td>{{clase.nombre}}</td>
			<td><span v-for="alumno in clase.alumnosNombres" :key="alumno">{{alumno}}<br/></span></td>
			<td>
				<button class="btn btn-primary" @click="editarClase({...clase, alumnos: [...clase.alumnos]})">🖊 Editar</button>
				<button class="btn btn-danger" @click="eliminarClase(clase._id)">❌ Eliminar</button>
			</td>
			</tr>
		</tbody>
		</table>
	</div>
  </div>
</template>

<script>
export default {
  name: 'BienvenidoAdministrador',
  data: () => {
    const aministrador = JSON.parse(localStorage.getItem('usuario'));
    return { 
		aministrador,
		alumnos: [],
		clase: {},
		clases: [],
		anadiendoClase: false,
		profesor: {},
		profesores: [],
		anadiendoProfesor: false,
		imagenOid: null,
    }
  },
  beforeMount(){
	const administrador = JSON.parse(localStorage.getItem('usuario'));
	if ( administrador.rol === "tutor" ) window.location = '/usuario';
	if ( administrador.rol === "secretaria" ) window.location = '/secretaria';
	// if ( administrador.rol === "administrador" ) window.location = '/administrador';	
  },
  mounted() {
	this.buscarAlumnos()
	this.buscaClases()
    this.buscarTutores()
  },
  methods: {
	async cerrarSession(){
		localStorage.removeItem('usuario')
		localStorage.removeItem('token')
		return window.location = '/'
	},
	async buscarAlumnos(){
		const alumnos = await fetch(`${process.env.VUE_APP_URL_BACK}/alumnos`,{
			method: 'GET',
			redirect: 'follow'
		})
        .then(response => response.text())
        .then(JSON.parse)
        .catch(error => console.log('error', error));

		this.alumnos = alumnos
	},
	async buscarTutores(){
		const profesores = await fetch(`${process.env.VUE_APP_URL_BACK}/usuario`,{
			method: 'GET',
			redirect: 'follow'
		})
        .then(response => response.text())
        .then(JSON.parse)
        .catch(error => console.log('error', error));

		const _profesores = profesores.filter(_profesor => _profesor.rol === 'tutor')

		const __profesores = []
        for await(const _profesor of _profesores) {

          if ( _profesor.foto ) {
            const foto = await fetch(`${process.env.VUE_APP_URL_BACK}/imagenes/${_profesor._id}`,{
              method: 'GET',
              redirect: 'follow'
            })
            .then(response => response.blob())
            .then(myBlob => URL.createObjectURL(myBlob))
            .catch(error => console.log('error', error));

            __profesores.push({..._profesor, foto: foto})
          } else {
            __profesores.push({..._profesor})
          }
          
        }

		this.profesores = __profesores
	},
	async buscaClases (){
		const clases = await fetch(`${process.env.VUE_APP_URL_BACK}/clase`,{
			method: 'GET',
			redirect: 'follow'
		})
        .then(response => response.text())
        .then(JSON.parse)
        .catch(error => console.log('error', error));

		this.clases = clases.map(_clase => { 
			_clase.alumnosNombres = _clase.alumnos.map(_alumno =>{
				const alumno = this.alumnos.find(__alumno => __alumno._id === _alumno);
				return alumno.nombre + ' '+ (alumno.apellidos.length ? alumno.apellidos[0] : '')
			})
			return {..._clase}
		})
	},
	async editarProfesor(profesor){
		this.anadiendoProfesor = true;
		this.profesor = profesor
	},
	async anadirProfesor(guardar){
		this.anadiendoProfesor = !this.anadiendoProfesor
		if ( guardar ){

			if (
				!this.profesor.nombre ||
				!this.profesor.usuario ||
				!this.profesor.contrasena
			) return alert('Debe rellenar toda la informacion')

			const body = {
				...this.profesor,
				rol: 'tutor'
			}

			if ( this.profesor._id ){
				const editado = await fetch(`${process.env.VUE_APP_URL_BACK}/usuario/${this.profesor._id}`,{
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
				// crear
				const creado = await fetch(`${process.env.VUE_APP_URL_BACK}/usuario`,{
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
		this.profesor = {
			apellidos:[],
			clases:[]
		}
	},
	async eliminarProfesor(profesorOid){
		const eliminado = await fetch(`${process.env.VUE_APP_URL_BACK}/usuario/${profesorOid}`,{
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
	},
	cambiarImagen(oid){
		this.imagenOid = oid
		this.$refs.file.click()
	},
	async subirFoto(event){

		const formData = new FormData();
		formData.append("archivo", event.target.files[0]);
        // formData.append('archivo', event.target.files[0]);
        const headers = {
			method: 'POST',
			body: formData,
			redirect: 'follow'
		};

		await fetch(`${process.env.VUE_APP_URL_BACK}/imagenes/${this.imagenOid}`, headers);
		
		await fetch(`${process.env.VUE_APP_URL_BACK}/usuario/${this.imagenOid}`,{
			method: 'PUT',
			redirect: 'follow',
			body: JSON.stringify({foto: this.imagenOid+".jpg"}),
			headers:{
			Authorization: `Bearer ${localStorage.getItem('token')}`,
				"Content-Type": "application/json"
			}
		})
		.then(response => response.text())
		.then(JSON.parse)
		.catch(error => console.log('error', error));

		this.imagenOid = null;
		return window.location.reload()
	},
	async editarClase(clase){
		this.anadiendoClase = true;
		this.clase = clase
	},
	async anadirClase(guardar){
		this.anadiendoClase = !this.anadiendoClase
		if ( guardar ) {
			if ( !this.clase.nombre ) return alert('Debe rellenar toda la informacion')

			const body = { ...this.clase }

			if ( this.clase._id ){
				const editado = await fetch(`${process.env.VUE_APP_URL_BACK}/clase/${this.clase._id}`,{
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
				// crear
				const creado = await fetch(`${process.env.VUE_APP_URL_BACK}/clase`,{
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
		this.clase = {
			alumnos: []
		}
	},
	async eliminarClase(claseOid){

		const eliminado = await fetch(`${process.env.VUE_APP_URL_BACK}/clase/${claseOid}`,{
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
		
	},


  }

}
</script>


<style>
#tabla-administrador{
  display: flex;
  flex-direction: column;
  justify-content:center;
}

#tabla-administrador > table{
  border: solid 1px;
  align-self: center;
  width: 50vw;
}

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