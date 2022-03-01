<div class="content audio-editor">
    <div class="actions">
        <div class="list-icon">
            <i class="fas fa-list"></i>
        </div>
        <div class="action-create">
            <p>
                Criar
            </p>
            <i class="fas fa-magic"></i>
        </div>
    </div>
    <div class="list-inside-content">
        <ul class="list-editors">

            {#if Audios.length <= 0}
                <h3>
                    Não há audios cadastrados
                </h3>
            {/if}

            {#if Audios.length >= 1}
                {#each Audios as item, i}
                    <li class="item-editor" data-audio="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/{item}" data-item="{item}">
                        <p>
                            <span>
                                <audio controls>
                                    <source src="https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/{item}" />
                                </audio>
                            </span>
                            <span>
                                {item.slice(47)}
                            </span>
                        </p>
                        <div class="action-editors">
                            <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                            <i class="fas fa-trash" data-id="{item.id}" on:click="{deleteAudio}"></i>
                        </div>
                    </li>
                {/each}
            {/if}
 
        </ul>
    </div>
    <div class="divider"></div>

    {#if thisAudio != undefined}
        <div class="audio-controller">
            <i class="fas fa-times" on:click={closeAudio}></i>
            <audio controls>
                <source  src="{thisAudio}" />
                <track kind="captions">
            </audio>
            {#if editorCreated}
                <button class="btn first" on:click={createAudio}>Cadastrar audio</button>
            {:else}
                <!-- <button class="btn second" on:click={updateAudio}>Atualizar</button> -->
            {/if}
        </div>
    {/if}


    <div class="content-creator">

        <input type="file" name="audio" id="audio" accept="audio/mp3">
        <button class="btn first" on:click={previewAudio}>Visualizar audio</button>

    </div>
</div>

<script>

    import { onMount } from 'svelte';
    import startARest, {startRestLoading, setNewNotification} from '../data/httpRequest.js';
    import rollDown from '../data/rollDown.js'; 

    let Audios = [];
    let editorCreated = true;
    let preview = false;
    let thisAudio;

    onMount(async () => {

        feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/audio/list', 'GET', null);
        
        if(res != undefined){

            let treatAudios = res[0].listStream;
            let treatedAudios = [];

            treatAudios.filter(audio => {
                if(audio.replace('audios/', '').length != 0) { 
                    treatedAudios.push(audio.replace('audios/', '')) 
                }
            })

            Audios = treatedAudios;

            setNewNotification('Audios carregados com sucesso!', 'success');

        } else {
            Audios = 'Audios não cadastrados';
        }


    }

    const handleEditValue = (e) => {
        thisAudio = e.target.parentElement.parentElement.dataset.audio;
        editorCreated = false;
    }

    const deleteAudio = async (e) => {
        
        await startARest(`/audio/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);
        
        setTimeout(() => {
            feedUpdate();
            preview = false;
        }, 500);

        rollDown();

        //setNewNotification('Audio deletado com sucesso!', 'success');
    }

    const previewAudio = () => {
        let getAudio = document.querySelector('#audio')
        thisAudio = window.URL.createObjectURL(getAudio.files[0]);

        preview = true;
        editorCreated = true;

    }

    
    const createAudio = async () => {

        let getAudio = document.querySelector('#audio')
        let audio = getAudio.files[0];

        await startARest('/audio/create', 'POST', audio, null, false, 'audio');

        setTimeout(() => {
            feedUpdate();
            preview = false;
            thisAudio = undefined;
        }, 500);

        rollDown();

        //setNewNotification('Audio criado com sucesso!', 'success');
    
    }

    const closeAudio = () => {
        thisAudio = undefined;
    }

    const updateAudio = () => {
        //console.log('em construção')
    }
</script>