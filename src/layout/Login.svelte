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
            <!-- <div class="container-field">
              <input type="email" name="email" id="email" bind:value={email}>
              <i class="far fa-envelope left"></i>
              <label for="email">Email</label>
            </div> -->
            <div class="container-field pass off-border">
              <input type="password" name="password" id="password" bind:value={password}>
              <i class="fas fa-lock left"></i>
              <label for="password">Password</label>
              <i class="far fa-eye-slash right" on:click={showPassword}></i>
            </div>
            <div class="container-field">
              <div class="action-login">
                {#if loginText == ''}
                  <div class="svg-loader">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="131px" height="131px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                      <circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="7" r="18" stroke-dasharray="84.82300164692441 30.274333882308138">
                        <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1.7543859649122806s" values="0 50 50;360 50 50" keyTimes="0;1"/>
                      </circle>
                      <!-- [ldio] generated by https://loading.io/ -->
                    </svg>
                  </div>
                {/if}
                <input type="submit" value={loginText}>
              </div>
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
              <div class="svg-loader">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="131px" height="131px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                  <circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="7" r="18" stroke-dasharray="84.82300164692441 30.274333882308138">
                    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1.7543859649122806s" values="0 50 50;360 50 50" keyTimes="0;1"/>
                  </circle>
                  <!-- [ldio] generated by https://loading.io/ -->
                </svg>
              </div>
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


<div class="morph-text">
  <span id="morhpeus"></span>
	<span id="neo"></span>
</div>

<svg id="filters">
	<defs>
		<filter id="threshold">
			<feColorMatrix in="SourceGraphic"
					type="matrix"
					values="1 0 0 0 0
									0 1 0 0 0
									0 0 1 0 0
									0 0 0 255 -140" />
		</filter>
	</defs>
</svg>

<!-- <div class="bg-effect">
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
</div> -->

<script>

    import { onMount } from 'svelte';
    import  startARest, {startRestLoading, setNewNotification, setCookie, getCookie, checkCookie}  from '../data/httpRequest.js';

    let username;
    let password;
    let email;
    let loginText = "LOGIN";

    onMount(async () => {

      startAllInputs();
      makeMorph();

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

      loginText = '';

      //startRestLoading();
      const logged = await startARest('/login', 'POST', json);

      if(logged){

        setNewNotification('Login efetuado com sucesso, você será redirecionado', 'success');

        loginText = "LOGIN";

        if(logged[0].token != undefined){
          setCookie('token', logged[0].token, 30);
          window.location.href = '/user';
        }
      }
    
    }

    const makeMorph = () => {
      let elts = {
        text1: document.getElementById("morhpeus"),
        text2: document.getElementById("neo")
      };

      let texts = [
        "Squadevops .Inc",
        "Unity",
        "Angular.js",
        "Svelte.js",
        "JavaScript",
        "Node",
        "PostgreSQL"
      ];

      let morphTime = 2;
      let cooldownTime = 1.25;

      let textIndex = texts.length - 1;
      let time = new Date();
      let morph = 0;
      let cooldown = cooldownTime;

      elts.text1.textContent = texts[textIndex % texts.length];
      elts.text2.textContent = texts[(textIndex + 1) % texts.length];


      const doMorph = () => {
        morph -= cooldown;
        cooldown = 0;
        
        let fraction = morph / morphTime;
        
        if (fraction > 1) {
          cooldown = cooldownTime;
          fraction = 1;
        }
        
        setMorph(fraction);
      }

      const setMorph = (fraction) => {
        // fraction = Math.cos(fraction * Math.PI) / -2 + .5;
        
        elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        
        fraction = 1 - fraction;
        elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        
        elts.text1.textContent = texts[textIndex % texts.length];
        elts.text2.textContent = texts[(textIndex + 1) % texts.length];
      }

      const doCooldown = () => {
        morph = 0;
        
        elts.text2.style.filter = "";
        elts.text2.style.opacity = "100%";
        
        elts.text1.style.filter = "";
        elts.text1.style.opacity = "0%";
      }

      const animate = () => {
        requestAnimationFrame(animate);
        
        let newTime = new Date();
        let shouldIncrementIndex = cooldown > 0;
        let dt = (newTime - time) / 1000;
        time = newTime;
        
        cooldown -= dt;
        
        if (cooldown <= 0) {
          if (shouldIncrementIndex) {
            textIndex++;
          }
          
          doMorph();
        } else {
          doCooldown();
        }
      }

      animate();
    }

</script>