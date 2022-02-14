<svelte:head>
    <script src="https://unpkg.com/frappe-charts@latest" on:load={initializeRemarkable}></script>
</svelte:head>


<div class="content skills-editor">
    <div class="actions">
        <div class="list-icon">
            <i class="fas fa-list"></i>
        </div>
        <div class="action-create" on:click={startEditor}>
            <p>
                Criar
            </p>
            <i class="fas fa-magic"></i>
        </div>
    </div>
    <div class="chart-controller">
        <div id="frost-chart"></div>
    </div>
    <div class="divider"></div>
    <div class="content-creator">

        <!-- labels: ["2009", "2010", "2011", "2012", "2013"] -->
        <!-- { name: 'Angular.js', values: [0,10,25,35,50]} -->

        <div class="two-content">
            <div class="limiter-inputs">
                <div class="input-control">
                    <label for="anos"> Tempo de desenvolvimento </label>
                    <input type="text" name="anos" id="anos" on:keyup={createTagYear}>
                    <div class="tags">
                        <div class="skillYears">
                            {#if YearSkill.length > 0}
                                {#each YearSkill as yskill}
                                    <span class="tag-yskill">
                                        {yskill}
                                    </span>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
        
                <div class="input-control">
                    <label for="stack">Tecnologia</label>
                    <input type="text" name="stack" id="stack">
                    <label for="valuestack"> Conhecimento Tecnologia </label>
                    <input type="text" name="valuestack" id="valuestack">
                </div> 
            </div>

            <div class="list-tagskills">
                <div class="skillyeartag"></div>
            </div>
    
            <div class="list-skills">
                <ul>
                    <li>
                        <span>
                            Angular.js
                        </span>
                        <span>
                            20,25,28,29,35
                        </span>
                    </li>
                </ul>
            </div>    
        </div>
     
        {#if editorCreated}
            <button class="btn first" on:click={createWord}>Criar</button>
        {:else}
            <button class="btn second" on:click={updateWord}>Atualizar</button>
        {/if}
     
    </div>
</div>

<script>
    import { onMount } from 'svelte';
    import  startARest, {startRestLoading, setNewNotification}  from '../data/httpRequest.js';

    let editorCreated = true;
    let YearSkill = [];
    let Skills = [];


    onMount(async () => {

        feedUpdate();

	});

    const createTagYear = (e) => {
        let yskill = e.target.value;
        if(yskill.length >= 4){
            let treat = yskill.split(',');
            let tag = document.querySelector('.skillyeartag');

            treat.forEach(tskillyear => {
                if(tskillyear.length >= 4){
                    if (YearSkill.includes(tskillyear) === false) {

                        YearSkill.push(tskillyear);
                        let spanSkill = document.createElement('span');
                            spanSkill.setAttribute('class', 'tag-skilly');
                            spanSkill.innerHTML = tskillyear;
                            tag.append(spanSkill);
                            //console.log(spanSkill)
                        
                    };
                    

                }
            });
            //console.log(yskill, yskill.length, treat)
        }
        
    }

    const feedUpdate = async () => {

        startRestLoading();

        //    const res = await startARest('/title', 'GET', null);
        //setNewNotification('Títulos carregados com sucesso!', 'success');

    }

    const createWord = () => {

        let json = {
		};

        // let res = startARest('/title/create', 'POST', json);
        
        // res.then(r => {
        //     console.log(r)
        // })

        // setTimeout(() => {
        //     feedUpdate();
        // }, 500);

    }

    const updateWord = () => {

        let json = {

		};

        // startARest(`/title/update/${identifier}`, 'PUT', json);

        // setTimeout(() => {
        //     feedUpdate();
        // }, 550);

    }

    const deleteWord = (e) => {

        // startARest(`/title/delete/${e.target.dataset.id}`, 'DELETE', null);

        // setTimeout(() => {
        //     feedUpdate();
        // }, 500);

    }

    const startEditor = (e) => {
        editorCreated = true;
    }

    const handleEditValue = (e) => {
        editorCreated = false;
    }

    const initializeRemarkable = async (titles, videos, images, audios, donate, total) => {
  
        new frappe.Chart( "#frost-chart", {
        data: {
            labels: ["2009", "2010", "2011", "2012", "2013"],
            datasets: [
                { name: 'Angular.js', values: [0,10,25,35,50]},
                { name: 'Node.js', values: [10,25,35,50,70]}
            ],
            yMarkers: [
                {
                    label: " ",
                    value: 100,
                    options: { labelPos: 'left' } // default: 'right'
                }
            ],
        },

        lineOptions: {
            regionFill: 1 // default: 0
        },

        title: "Skills Cadastradas",
        type: 'line', // or 'bar', 'line', 'pie', 'percentage'
        height: 300,
        colors: ['#ffa3ef', 'light-blue'],

            tooltipOptions: {
                formatTooltipX: d => (d + '').toUpperCase(),
                formatTooltipY: d => d + ' ',
            }
        });

        }


</script>