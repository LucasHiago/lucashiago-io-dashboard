<div class="content payment-editor">
    <div class="actions">
        <div class="list-icon">
            <i class="fas fa-list"></i>
        </div>
    </div>
    <div class="list-inside-content">
        <ul class="list-editors">
  
                {#if Payments.length <= 0}
                    <h3>
                        Não há pagamentos cadastrados
                    </h3>
                {/if}

                {#if Payments.length >= 1}

                    <li class="item-editor">
                        <p style="font-weight: bold;">
                            <span>
                                ID
                            </span>
                            <span>
                                Nome
                            </span>
                            <span>
                                Status
                            </span>
                            <span>
                                Doação
                            </span>
                            <span>
                                Pedido
                            </span>
                            <span>
                                Data pagamento
                            </span>
                            <span>
                                Tipo de pagamento
                            </span>
                        </p>
                    </li>

                    {#each Payments as item, i}
                        <li class="item-editor" data-item="{JSON.stringify(item)}">
                            <p>
                                <span>
                                    {item.id}
                                </span>
                                <span>
                                    {item.display_name}
                                </span>
                                <span class="payment-{item.status}">
                                    {item.status}
                                </span>
                                <span>
                                    <strong>
                                        R${item.transaction_amount}
                                    </strong>
                                </span>
                                <span>
                                    {item.purchase_order}
                                </span>
                                <span>
                                    {new Date(item.date_approved).toLocaleDateString()}
                                </span>
                                <span>
                                    {item.first_six_digits}XXXXXX {item.last_four_digits}
                                </span>
                            </p>
                        </li>
                    {/each}
                {/if}

        </ul>
    </div>

</div>

<script>

    import { onMount } from 'svelte';
    import startARest, {setNewNotification, startRestLoading} from '../data/httpRequest.js';

    let Payments = [];

    onMount(async () => {

        await feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/history/payments', 'GET', null);

        res != undefined ? Payments = res[0].getPayments : Payment = 'Pagamentos não efetuados';
        res != undefined ? setNewNotification('Pagamentos carregados com sucesso!', 'success') : '';


    }

</script>