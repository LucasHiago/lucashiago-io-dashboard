<aside>

    <div class="person">
        <a href="/">
            <img class="image-person" {src} alt="profile">
        </a>
    </div>

    <ul class="list-editors">

        {#each sidebar_items as item}
            
            <li class="item">
                <a class="editor" href={item.path}>
                    <p class="unview">
                        Editor {item.name}
                    </p>
                    {@html item.icon}
                </a>
            </li>

        {/each}

    </ul>
    
</aside>

<script>
 
    export let sidebar_items;
    const src = '/images/person.jpg';

</script>