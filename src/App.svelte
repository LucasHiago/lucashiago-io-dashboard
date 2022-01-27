<main>
	
	<Header title={'Little bit older'} />

	<div class="main">

			<Sidebar sidebar_items={sidebar_routes} />

			<section>

				<svelte:component this="{page}" params="{params}" />	

				{#if !buttonOff}
					<button on:click={actionExample}>Teste de disparo</button>
				{/if}
				
			</section>

	</div>

</main>

<script>
	import { routesArray } from './data/routes.js';

	import Header from './layout/Header.svelte';
	import Sidebar from './layout/Sidebar.svelte';
	import Dash from './layout/Dash.svelte';
	import NotFound from './layout/NotFound.svelte';

	import Word from './editors/Word.svelte';
	import Video from './editors/Video.svelte';
	import Image from './editors/Image.svelte';
	import Audio from './editors/Audio.svelte';
	import Payment from './editors/Payment.svelte';
	import Codes from './editors/Codes.svelte';

	import router from "page";

	let page;
    let params;

	router('/', 
		(ctx, next) => {
			params = ctx.params
			next()
		},
	() => (page = Dash));
	router('/word', () => (page = Word));
	router('/video', () => (page = Video));
	router('/image',
		(ctx, next) => {
			params = ctx.params
			next()
		},
	() => (page = Image));
	router('/audio', () => (page = Audio));
	router('/payment', () => (page = Payment));
	router('/codes', () => (page = Codes));
	router('/*', () => (page = NotFound));
	router.start();

	let sidebar_routes;

	routesArray.subscribe(routes =>  sidebar_routes = routes);

	let buttonOff = true;

	function actionExample(){
		console.log('action occurs');
	}
</script>


