<svelte:head>
	<link rel="stylesheet" href="/css/main.css">
</svelte:head>

<main>
	
	{#if thispage != 'Checkout' && thispage != 'Login' && thispage != 'Unauthorized'}
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
	{:else if thispage == 'Login'}
		<section class="Login">

			<svelte:component this="{page}" params="{params}" />	

		</section>
	{:else if thispage == 'Unauthorized'}
		<section class="Unauthorized">

			<svelte:component this="{page}" params="{params}" />	

		</section>
	{:else}
		<section class="checkout">

			<svelte:component this="{page}" params="{params}" />	

		</section>
	{/if}

</main>

<div class="notifications-controller"></div>

<script>
	import { routesArray } from './data/routes.js';

	import Header from './layout/Header.svelte';
	import Sidebar from './layout/Sidebar.svelte';
	import Dash from './layout/Dash.svelte';
	import NotFound from './layout/NotFound.svelte';
	import Checkout from './layout/Checkout.svelte';
	import Login from './layout/Login.svelte';
	import Unauthorized from './layout/Unauthorized.svelte';

	import Word from './editors/Word.svelte';
	import Video from './editors/Video.svelte';
	import Image from './editors/Image.svelte';
	import Audio from './editors/Audio.svelte';
	import Payment from './editors/Payment.svelte';
	import Codes from './editors/Codes.svelte';
	import Skills from './editors/Skills.svelte';
	import Lead from './editors/Leads.svelte';
	import Quest from './editors/Quests.svelte';
	import Questions from './editors/Questions.svelte';
	import QClients from './editors/QuestionsClients.svelte';
	import Collab from './editors/Collab.svelte';
	import Work from './editors/Work.svelte';
	import ClientLeads from './editors/LeadsClient.svelte';
	import Cases from './editors/Cases.svelte';

	import router from "page";

	let page;
	let thispage;
    let params;

	router('/', 
		(ctx, next) => {
			params = ctx.params;
			thispage = 'Login';
			next()
		},
	() => (page = Login));

	router('/user', 
		(ctx, next) => {
			params = ctx.params
			next()
		},
	() => (page = Dash));

	router('/checkout', 
		(ctx, next) => { 
			thispage = 'Checkout';
		 	next()
		},
	() => (page = Checkout));

	router('/leads', (ctx, next) => {
		params = ctx.params;
		next()
	}, () => (page = Lead));

	router('/quest', () => (page = Quest));
	router('/faq', () => (page = Questions));
	router('/client', () => (page = QClients));
	router('/clientl', () => (page = ClientLeads));
	router('/collab', () => (page = Collab));
	router('/cases', () => (page = Cases));
	router('/word', () => (page = Word));
	router('/work', () => (page = Work));
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
	router('/skills', () => (page = Skills));
	router('/unauthorized',
		(ctx, next) => {
			params = ctx.params;
			thispage = 'Unauthorized';
			next()
		},
	() => (page = Unauthorized));
	router('/*', () => (page = NotFound));
	router.start();

	let sidebar_routes;

	routesArray.subscribe(routes =>  sidebar_routes = routes);

	let buttonOff = true;

	function actionExample(){
		//console.log('action occurs');
	}
</script>


