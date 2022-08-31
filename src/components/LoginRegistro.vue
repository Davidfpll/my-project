<template>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"  integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
<div id="login-registro" class="row">
	<div class="col-12">
		<div class="logo centrar">
			<img width="200" src="https://www.fpllefia.com/images/logollefia_blanco2.png" alt="">
		</div>

		<div class="columnas">

			<div class="inputusuario separacion">
				<input
					v-model="usuario"
					type="usuario"
					:class="{ 'is-invalid': procesando && usuarioInvalido }"
					class="form-control"
					placeholder="Usuario"
				/>
			</div>
			<div class="inputusuario separacion">
				<input 
					type="password"
					placeholder="Contraseña"
					class="form-control"
					v-model="contrasena"
				/>
			</div>
		</div>
		<div class="separacion acceder text-center pb-5">
			<button 
				type="button"
				class="btn btn-primary"
				@click="login(usuario,contrasena)"
			>Acceder</button>
			<!-- <button 
				type="button"
				class="btn btn-secondary"
				@click="()=>{
					this.$router.push('/registroLogin')
				}"
			>Registrarse</button> -->
		</div>
	</div>
</div>
</template>

<script>
export default {
   name: 'login-registro',
   data() {
		return {
			usuario:'',
			contrasena: ''
		}
	},
	methods: {

		async login(usuario,contrasena){

			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					"usuario": usuario,
					"contrasena": contrasena
				}),
				redirect: 'follow'
			};

			await fetch(`${process.env.VUE_APP_URL_BACK}/login`, requestOptions)
			.then(response => response.text())
			.then(response => {
				response = JSON.parse(response)

				if(response && response.token){
					localStorage.setItem("usuario", JSON.stringify(response));
					localStorage.setItem("token", response.token);

					if ( response.rol === "tutor" ) window.location = '/usuario';
					if ( response.rol === "secretaria" ) window.location = '/secretaria';
					if ( response.rol === "administrador" ) window.location = '/administrador';
				}
			})
			.catch(error => console.log('error', error));
		}
	}
};
</script>


<style>

.columnas {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo {
	background-color:grey;
}

.centrar {
	display: flex;
	justify-content: center;
}
.logo img {
	width: 20vw;
}

.separacion{
	margin-top: 20px;
}

.inputusuario{
	width: 20vw !important;
}
</style>