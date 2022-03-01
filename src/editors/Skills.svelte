<svelte:head>
    <script src="https://unpkg.com/frappe-charts@latest"></script>
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
                    <label for="stack">Tecnologia</label>
                    <input type="text" name="stack" id="stack" bind:value={stackdevelop}>
                    <label for="anos"> Tempo de desenvolvimento <span class="yearcreated"></span> </label>
                    <input type="text" name="anos" id="anos" bind:value={timedevelop} on:keyup={createListYear}>
                    <label for="valuestack" class="highlited"> Conhecimento Tecnologia % <span class="hightlited-year" ></span> </label>
                    <input type="text" name="valuestack" id="valuestack" bind:value={knowdevelop} on:keyup={highlightYear}>
                </div> 
            </div>
    
            <div class="list-skills">
                {#if typeof Skills == 'string'}
                <h3>
                    {Skills}
                </h3>
            {/if}

            {#if typeof Skills != 'string'}
                {#each Skills as item, key}
                    <li class="item-editor">
                        <p>
                            {#if item.stack}
                                <span class="stack" data-id={item.id}>
                                    {item.stack}
                                </span>
                            {/if}
                            {#if item.stackvalues}
                                <span class="stackvalue" data-stackvalues={item.stackvalues}>
                                    {#each item.stackvalues.split(',') as stackvalue }
                                        <span class="tag-know">
                                            {stackvalue}
                                        </span>
                                    {/each}
                                </span>
                            {/if}
                            {#if item.stackTime}
                                <span class="stacktime" data-stacktime={item.stackTime}>
                                    {#each item.stackTime.split(',') as stacktime}
                                        <span class="tag-skilly">
                                            {stacktime}
                                        </span>
                                    {/each}
                                </span>
                            {/if}
                        </p>
                        <div class="action-editors">
                            <i class="fas fa-edit" on:click="{handleEditValue}"></i>
                            <i class="fas fa-trash" data-id="{item.id}" on:click="{deleteSkill}"></i>
                        </div>
                    </li>
                {/each}
            {/if}
            </div>    
        </div>
     
        {#if editorCreated}
            <button class="btn first" on:click={createSkill}>Criar</button>
        {:else}
            <button class="btn second" on:click={updateSkill}>Atualizar</button>
        {/if}
     
    </div>
</div>

<script>
    import { onMount } from 'svelte';
    import  startARest, {startRestLoading, setNewNotification}  from '../data/httpRequest.js';

    let editorCreated = true;
    let YearSkill = [];
    let KnowledgeSkill = [];
    let Skills = [];
    let stackdevelop;
    let knowdevelop;
    let timedevelop;
    let identifier;

    onMount(async () => {

        feedUpdate();

	});

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/skill', 'GET', null);
        
        if(res != undefined){
            Skills = res[0].getSkills;
            setNewNotification('Habilidades carregadas com sucesso!', 'success');
            initializeRemarkable(Skills);
        } else {
            Skills = 'Skills não cadastradas';
        }



    }

    const createSkill = async () => {

        let json = {
            stack: stackdevelop,
            stackvalues: knowdevelop,
            stacktime: timedevelop
		};

        await startARest('/skill/create', 'POST', json);
        
        setTimeout(() => {
            feedUpdate();
        }, 800);

        //setNewNotification('Habilidade cadastrada', 'success');

    }

    const updateSkill = () => {

        let json = {
            stack: stackdevelop,
            stackvalues: knowdevelop,
            stacktime: timedevelop
		};

        startARest(`/skill/update/${identifier}`, 'PUT', json);

        setNewNotification('Habilidade atualizada', 'success');

        setTimeout(() => {
            feedUpdate();
        }, 800);

    }

    const deleteSkill = async (e) => {

        await startARest(`/skill/delete/${e.target.dataset.id}`, 'DELETE', null);

        setTimeout(() => {
            feedUpdate();
        }, 800);

        //setNewNotification('Habilidade deletada', 'success');

    }

    const startEditor = (e) => {

        stackdevelop = '';
        knowdevelop = '';
        timedevelop = '';
        YearSkill = [];

        editorCreated = true;
    }

    const createListYear = (e) => {
        let yskill = e.target.value;

        if(yskill.length >= 4){

        let treat = yskill.split(',');

        console.log(treat)

            treat.forEach(tskillyear => {
                if(tskillyear.length >= 4){
                    if (YearSkill.includes(tskillyear) === false) {
                        YearSkill.push(tskillyear);
                    };
                }
            });

        } else {
            YearSkill = [];
        }
    }

    const highlightYear = (e) => {
        let skillValue = e.target.value;
        let treat = skillValue.split(',');
        let hightlitedYear = document.querySelector('.hightlited-year');

        if(e.target.value != 0){
            if(YearSkill[treat.length - 1] != undefined) {
                hightlitedYear.innerHTML = `<span class="inside" > ${YearSkill[treat.length - 1]} </span>`;
            } else {
                hightlitedYear.innerHTML = '<span class="inside error" >Ano não cadastrado, por favor cadastre</span>';
            }
        } else {
            if(YearSkill[0] != undefined){
                hightlitedYear.innerHTML = `<span class="inside" > ${YearSkill[0]} </span>`;
            } else {
                hightlitedYear.innerHTML = '<span class="inside error" >Ano não cadastrado, por favor cadastre</span>';
            }
        }
    }

    const handleEditValue = (e) => {

        identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
        stackdevelop = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
        knowdevelop = e.target.parentElement.parentElement.children[0].children[1].dataset.stackvalues;
        timedevelop = e.target.parentElement.parentElement.children[0].children[2].dataset.stacktime;

        editorCreated = false;
  
    }

    const initializeRemarkable = async (skills) => {
        let sets = [];
        let checkMaxTime = [];
        let getBiggestDate;

        skills.forEach(skill => {

            let getLengthTime = skill.stackTime.split(',');
            let stackValuesr = skill.stackvalues.split(',');

            YearSkill = getLengthTime;
            timedevelop = YearSkill.join(',');
            KnowledgeSkill = stackValuesr;

            checkMaxTime.push({time: getLengthTime.length, value: getLengthTime})
            sets.push({ name: skill.stack, values: stackValuesr });
            
        });


        let getBig = Math.max.apply(Math, checkMaxTime.map(biggest =>  biggest.time ));
        checkMaxTime.map(bigger => {
            if(getBig == bigger.value.length){
                getBiggestDate = bigger.value;
            }
        })


        new frappe.Chart( "#frost-chart", {
        data: {
            labels: getBiggestDate,
            datasets: sets,
            yMarkers: [
                {
                    label: " ",
                    value: 100,
                    options: { labelPos: 'left' } // default: 'right'
                }
            ],
        },

        lineOptions: {
            regionFill: 0 // default: 0
        },

        title: "Skills Cadastradas",
        type: 'line', // or 'bar', 'line', 'pie', 'percentage'
        height: 300,
        colors: ['#ffa3ef', '#2a2a2a', '#8a00f2', '#fffb00', '#37f89b', '#ff1465'],

            tooltipOptions: {
                formatTooltipX: d => (d + '').toUpperCase(),
                formatTooltipY: d => d + ' ',
            }
        });

        }


</script>