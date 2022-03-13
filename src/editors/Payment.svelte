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
                        {#if item.overpaid_amount == undefined}
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
                                    <span>
                                        Credit Card
                                    </span>
                                </p>
                            </li>
                        {:else}
                            <li class="item-editor pix-payment" data-item="{JSON.stringify(item)}" data-id="{item.id}" data-purchaseorder="{item.purchase_order}" use:checkPayment>
                                <p>
                                    <span>
                                        {item.id}
                                    </span>
                                    {#if item.first_name}
                                        <span>
                                            {item.first_name}
                                        </span>
                                    {/if}
                                    <span class="payment-{item.status}">
                                        {item.status}
                                    </span>
 
                                    {#if item.net_received_amount > 0}
                                        <span>
                                            {item.net_received_amount}
                                        </span>
                                    {/if}
                                    {#if item.transaction_amount > 0}
                                        <span>
                                            <strong> R${item.transaction_amount} </strong> 
                                        </span>
                                    {/if}
                                    <span>
                                        {item.purchase_order}
                                    </span>
                                    {#if item.overpaid_amount > 0}
                                        <span>
                                            {item.overpaid_amount}
                                        </span>
                                    {/if}
                                    {#if item.installment_amount > 0}
                                        <span>
                                            {item.installment_amount}
                                        </span>
                                    {/if}
                                    {#if item.status == 'pending'}
                                        <span>
                                            <img style="width:250px; margin:15px" src="data:image/jpeg;charset=utf-8;base64, {item.qr_code_base64}" alt="">
                                            <br>
                                            {item.qr_code}
                                        </span>
                                    {/if}
                                    <span>
                                        Pix payment
                                    </span>
                                </p>
                            </li>
                        {/if}
                    {/each}
                {/if}
        </ul>
    </div>

</div>

<script>

    import { onMount } from 'svelte';
    import startARest, {setNewNotification, startRestLoading, checkLogged} from '../data/httpRequest.js';

    let Payments = [];

    onMount(async () => {

        checkLogged();
        feedUpdate();

    });

    const feedUpdate = async () => {

        startRestLoading();

        const res = await startARest('/history/payments', 'GET', null);

        res != undefined ? Payments = res[0].getPayments : Payment = 'Pagamentos não efetuados';
        res != undefined ? setNewNotification('Pagamentos carregados com sucesso!', 'success') : '';

    }

    const checkPayment = async (e) => {
        //listPayments.push({ id:e.dataset.id, purchase_order:e.dataset.purchaseorder });

        let json = {
            purchase_order: e.dataset.purchaseorder,
            id: e.dataset.id
        }

        const res = await startARest('/update/pix/status', 'POST', json)

    }


</script>