<div class="unauthorized-controller">
    <img src="/images/unauthorized.jpg" alt="" class="unauthorized-image">
    <h1>
        Unauthorized
    </h1>
</div>

<script>
    import { onMount } from 'svelte';
    import startARest, { setNewNotification } from '../data/httpRequest.js';

    onMount(async () => {
        goToHome();
    });

    const goToHome = () => {
        let progressBar = document.createElement('progress');

        progressBar.setAttribute('max', '250');
        progressBar.setAttribute('value', '250');
        progressBar.setAttribute('class', 'unauthorized-progress');


        document.body.append(progressBar);

        let clearProgress = setInterval(function() {

        progressBar.value = progressBar.value - 1;

        if (progressBar.value == 0) {
            clearInterval(clearProgress);
            progressBar.classList.add('hide');
            setNewNotification('Você será redirecionado!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
        }, 25);
    }
</script>