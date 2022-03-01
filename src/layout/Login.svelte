<svelte:head>
    <link rel="stylesheet" href="https://use.typekit.net/bcx4cmo.css">
    <script src="https://kit.fontawesome.com/1175358d69.js" crossorigin="anonymous"></script>
</svelte:head>

<div class="content-controller">
    <div class="logo">
      <img src="./images/login-icon.png" alt="">
    </div>
    <div class="forms">
      <div class="form-register">
        <form autocomplete="no" on:submit|preventDefault={makeLogin}>
            <div class="container-field">
                <input type="text" name="username" id="username" bind:value={username}>
                <i class="fa fa-user-secret left"></i>
                <label for="username">Username</label>
            </div>
            <div class="container-field">
              <input type="email" name="email" id="email" bind:value={email}>
              <i class="far fa-envelope left"></i>
              <label for="email">Email</label>
            </div>
            <div class="container-field pass off-border">
              <input type="password" name="password" id="password" bind:value={password}>
              <i class="fas fa-lock left"></i>
              <label for="password">Password</label>
              <i class="far fa-eye-slash right" on:click={showPassword}></i>
            </div>
            <div class="container-field">
              <input type="submit" value="LOGIN">
            </div>
        </form>
      </div>
      <div class="form-login unview">
         <form>
           <div class="container-field">
              <input type="text" name="name" id="name">
              <i class="far fa-user left"></i>
              <label for="name">Name</label>
            </div>
            <div class="container-field">
              <input type="email" name="email" id="email2">
              <i class="far fa-envelope left"></i>
              <label for="email2">Email address</label>
            </div>
            <div class="container-field pass">
              <input type="password" name="password" id="password2">
              <i class="fas fa-lock left"></i>
              <label for="password2">Password</label>
              <i class="far fa-eye-slash right"></i>
            </div>
            <div class="container-field pass off-border">
              <input type="password" name="cpassword" id="cpassword">
              <i class="fas fa-lock left"></i>
              <label for="cpassword">Confirm pass</label>
              <i class="far fa-eye-slash right"></i>
            </div>
            <div class="container-field">
              <input type="submit" value="REGISTER">
            </div>
        </form>
      </div>
    </div>
    <div class="actions unview">
      <div class="login-action unview" data-action="login" on:click={changeForm}>
        <p>
            Já possui cadastro? <strong> Fazer Login </strong>
        </p>
      </div>
      <div class="register-action" data-action="register" on:click={changeForm} >
        <p>
            Não tem conta? <strong> Fazer cadastro </strong>
        </p>
      </div>
    </div>
</div>

<div class="bg-effect">
    <svg class="rect-rotate" id="bg-rect-one" width="75" height="75" xmlns="http://www.w3.org/2000/svg">
      <rect width="75" height="75" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
    </svg>
    <svg class="rect-rotate" id="bg-rect-two"  width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
    </svg>
    <svg class="rect-rotate" id="bg-rect-three"  width="75" height="75" xmlns="http://www.w3.org/2000/svg">
      <rect width="75" height="75" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
    </svg>
</div>

<div class="bg-effect reverse">
  <svg class="rect-rotate" id="bg-rect-one" width="75" height="75" xmlns="http://www.w3.org/2000/svg">
    <rect width="75" height="75" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
  </svg>
  <svg class="rect-rotate" id="bg-rect-two"  width="150" height="150" xmlns="http://www.w3.org/2000/svg">
    <rect width="150" height="150" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
  </svg>
  <svg class="rect-rotate" id="bg-rect-three"  width="75" height="75" xmlns="http://www.w3.org/2000/svg">
    <rect width="75" height="75" stroke="currentColor" fill="transparent" stroke-width="15"></rect>
  </svg>
</div>

<script>

    import { onMount } from 'svelte';
    import  startARest, {startRestLoading, setNewNotification, setCookie, getCookie, checkCookie}  from '../data/httpRequest.js';

    let username;
    let password;
    let email;

    onMount(async () => {

      startAllInputs();

    });

    const startAllInputs = () => {
      let anyinput = document.querySelectorAll('input');

      anyinput.forEach(thisInput => {
        thisInput.addEventListener('change', () => checkInputValues(thisInput) );
        thisInput.addEventListener('keypress', () => checkInputValues(thisInput) );
      });
    }


    const checkInputValues = (inpuType) => {
      if(inpuType.type != 'submit'){
          if(inpuType.value.length > 0){
            inpuType.classList.add('hasvalue');
          } else {
            inpuType.classList.remove('hasvalue');
          }
      }
    }

    const changeForm = (e) => {
        let login = document.querySelector('.login-action');
        let register = document.querySelector('.register-action');
        let flogin = document.querySelector('.form-login');
        let fregister = document.querySelector('.form-register');
        
        if(e.target.dataset.action == 'login'){
            login.classList.add('unview');
            flogin.classList.add('unview');
            register.classList.remove('unview');
            fregister.classList.remove('unview');
        } else {
            register.classList.add('unview');
            fregister.classList.add('unview');
            login.classList.remove('unview');
            flogin.classList.remove('unview');
        }
    }

    const showPassword = (e) => {
      let showpass = document.querySelector('#password');

      showpass.type === 'password' ? showpass.type = 'text' : showpass.type = 'password';
      ['fa-eye', 'fa-eye-slash'].map( multipleToggle => e.target.classList.toggle(multipleToggle) );

    }

    const makeLogin = async () => {
      let json = {
          username,
          password,
          email,
      };

      //startRestLoading();
      const logged = await startARest('/login', 'POST', json);

      if(logged){

        setNewNotification('Login efetuado com sucesso, você será redirecionado', 'success');

        if(logged[0].token != undefined){
          setCookie('token', logged[0].token, 30);
          window.location.href = '/user';
        }
      }
    
    }
</script>