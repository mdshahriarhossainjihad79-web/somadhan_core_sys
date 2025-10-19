<div class="col-md-12 grid-margin stretch-card">
    <div class="card">
        <div class="card-body">
            <h6 class="card-title text-info ">Transaction Receive </h6>
            <div class="table-responsive">
                <table id="example" class="table">
                    <thead class="action">
                        <tr>
                            <th>SN</th>
                            <th>Details</th>
                            <th>Transaction Date & Time</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Transaction Amount</th>
                            <th>Transaction Type</th>
                            <th>Trans. Method</th>
                            <th>Note</th>
                            <th class="actions">Action</th>
                             @if ($link_invoice_payment == 1)
                            <th>Link Payment</th>
                             @endif
                            <th>Status</th>

                        </tr>
                    </thead>
                    <tbody class="showData">
                @if ($transaction->count() > 0 && $transaction->contains('payment_type', 'receive'))
                            @foreach ($transaction->where('payment_type', 'receive')->where('particulars', 'party receive') as $key => $trans)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    @if ($trans->customer_id != null)
                                        <td> Customer <br> Name: {{ $trans['customer']['name'] ?? '-' }} <br> Phone:
                                            {{ $trans['customer']['phone'] ?? '-' }}</td>
                                    @elseif ($trans->supplier_id != null)
                                        <td>Supplier <br> Name: {{ $trans['supplier']['name'] ?? '-' }} <br> Phone:
                                            {{ $trans['supplier']['phone '] ?? '-' }}</td>
                                        <!---Add This Line---->
                                    @elseif ($trans->others_id != null)
                                        <td>Others <br> Name: {{ $trans['investor']['name'] ?? '-' }} <br> Phone:
                                            {{ $trans['investor']['phone'] ?? '-' }}</td>
                                    @else
                                        <td></td>
                                        <!---Add This Line --->
                                    @endif
                                    @php
                                        $dacTimeZone = new DateTimeZone('Asia/Dhaka');
                                        $created_at = optional($trans->created_at)->setTimezone($dacTimeZone);
                                        $formatted_date = optional($trans->created_at)->format('d F Y') ?? '';
                                        $formatted_time = $created_at ? $created_at->format('h:i A') : '';
                                    @endphp

                                    <td>{{ $formatted_date ?? '-' }} <Span style="color:brown">:</Span>
                                        {{ $formatted_time ?? '-' }}</td>
                                        <td>{{$trans->debit}}</td>
                                        <td>{{$trans->credit}}</td>
                                   @if( $trans->balance > 0)
                                    <td>
                                    {{$trans->balance}}
                                    </td>
                                    @elseif( $trans->balance < 0)
                                     <td>
                                    {{ - $trans->balance}}
                                     </td>
                                    @else
                                     <td>
                                    {{  $trans->balance}}
                                     </td>
                                     @endif
                                     <td>
                                        @if ($trans->payment_type == 'pay')
                                            <span>Cash Payment</span>
                                        @else
                                            <span>Cash Received</span>
                                        @endif
                                        </td>
                                    <td>{{ $trans['bank']['name'] ?? '' }}</td>
                                    <td class="note_short">
                                        @php
                                            $note = $trans->note ?? 'N/A';
                                            $noteChunks = str_split($note, 20);
                                            echo implode('<br>', $noteChunks);
                                        @endphp
                                    </td>
                                     <td class="text-warning">{{$trans->status}}
                                     <td>
                                     @if ($link_invoice_payment == 1)
                                    @if( $trans->status ==='unused')
                                    <button type="button"
                                        class="btn btn-outline-primary btn-icon-text float-left add_money_modal"
                                        id="payment-btn" data-customer-id="{{ $trans->customer_id }}" data-transacton-id="{{ $trans->id }}"   data-bs-toggle="modal" data-bs-target="#linkDuePayment">
                                        <i class="btn-icon-prepend" data-feather="credit-card"></i>
                                        link Payment
                                    </button>
                                    @else
                                    <button type="button"
                                        class="btn btn-outline-primary btn-icon-text float-left ">
                                        <i class="btn-icon-prepend" data-feather="credit-card"></i>
                                        Used
                                    </button>
                                     @endif
                                   @endif
                                  </td>

                                     </td>
                                    <td class="actions">
                                        <a href="{{ route('transaction.invoice.receipt', $trans->id) }}"
                                            class="btn btn-sm btn-primary " title="Print">
                                            <i class="fa fa-print"></i><span style="padding-left: 5px">Receipt</span>
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="12">
                                    <div class="text-center text-warning mb-2">Data Not Found</div>
                                </td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<!--Link Payment  Modal add Payment -->
        <div class="modal fade" id="linkDuePayment" tabindex="-1" aria-labelledby="exampleModalScrollableTitle1"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalScrollableTitle1">Link Due Payment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addLinkPaymentForm" class="addLinkPaymentForm row" method="POST">
                            <input type="hidden" name="customer_id" value="">
                            <input type="hidden" name="transaction_id" value="">
                    <input type="hidden" name="unused_amount" id="unused_amount" class="form-control">
                        <div class="mb-3 col-md-12">
                            <p class="" id="unused_balance"></p>
                        </div>
                            <div class="mb-3 col-md-12">
                                <p class="" id="Select_balance"></p>
                            </div>
                                <div class="link-invoice">
                                    <table id="DueinkInvoiceTable" class="table table-bordered align-middle">
                                        <thead class="table-light">
                                            <tr>
                                                <th><input type="checkbox" id="selectAll"></th>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Ref/Inv No.</th>
                                                <th>Total</th>
                                                <th>Paid</th>
                                                <th>Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>

                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <a type="button" class="btn btn-primary" id="add_link_payment">Payment</a>
                    </div>
                </div>
            </div>
        </div>
<script>
            $(document).ready(function() {

            $('.add_money_modal').on('click', function() {
                updateTotalDue()

                const customerId = $(this).data('customer-id'); //
                const transactionId = $(this).data('transacton-id'); //
                const $form = $('#addLinkPaymentForm');

                $form.find('input[name="customer_id"]').val(customerId);
                $form.find('input[name="transaction_id"]').val(transactionId || '');
                const $modal = $('#linkDuePayment');
                $modal.data('customer-id', customerId);
                $modal.data('transaction_id', transactionId || '');

                let url = `/get-due-invoice/${customerId}`;
                if (transactionId) {
                    url += `?transaction_id=${transactionId}`;
                }
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function(response) {

                        let tableBody = $('#DueinkInvoiceTable tbody');
                        tableBody.empty();

                        ///Unused Payment Start
                        $('#unused_balance').text(
                            response.transctionUnsedAmount
                                ? `Unused Amount: ${response.transctionUnsedAmount}`
                                : 'Unused Amount: 0.00'
                        );
                        const unusedAmount = response.transctionUnsedAmount
                        ? parseFloat(response.transctionUnsedAmount)
                        : '0.00';
                        $('input[name="unused_amount"]').val(unusedAmount);
                        ///Unused Payment End
                        if (response.data) {
                            // Clear any existing rows
                            const openingDue = response.openingDue ?? 0;
                            const openingDueDate = response.openingDueDate ?? 0;
                            const openingDueId = response.openingDueId ?? 0;
                            if (openingDue > 0) {
                                const openingDueRow = `
                            <tr>
                                <td>
                                    <input type="checkbox" class="row-checkbox"
                                        transaction_id="${openingDueId}"
                                        data-due="${openingDue}">
                                </td>
                                <td>${openingDueDate}</td>
                                <td>Opening Due</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>N/A</td>
                                <td>${openingDue}</td>
                            </tr>
                        `;
                                tableBody.append(openingDueRow); // টেবিলের উপরে সারি যোগ করুন //
                            }

                            response.data.forEach(function(transaction) {

                                if (transaction.particulars === 'OpeningDue') {
                                    return; //
                                }
                                if (transaction.sale.status === 'paid') {
                                    return; //
                                }

                                const totalDue = transaction.sale ? transaction.sale.change_amount -
                                    transaction.sale.paid : 0;

                                // Only add rows with positive total due
                                // const conditionDue = transaction.sale.due;

                                if (totalDue > 0) {
                                    const row = `
                            <tr>
                            <td>
                    <input type="checkbox" class="row-checkbox"
                    sale_id="${transaction.sale?.id ?? ''}"
                    data-due="${totalDue}">
                        </td>
                        <td>${transaction.date ?? ''}</td>
                        <td>${transaction.particulars ?? ''}</td>
                        <td>${transaction.sale?.invoice_number ?? 'N/A'}</td>
                        <td>${transaction.sale?.change_amount ?? ""}</td>
                        <td>${transaction.sale?.paid ??""}</td>
                        <td>${totalDue > 0 ? totalDue  : ""}</td>
                            </tr>
                        `;
                                    tableBody.append(row);
                                    $('.row-checkbox').on('change', function() {
                                        updateTotalDue();

                                    });
                                }

                            });

                        } else {
                            // alert('No transactions found.');
                        }
                        // Update totals after populating tables
                    updateTotalDue();

                    },
                    error: function() {
                        alert('Failed to fetch transactions.');
                    }
                });
            });
         // Handle "Select All" checkbox
            $('#selectAll').on('click', function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox').prop('checked', isChecked);
                updateTotalDue();

            });

             function updateTotalDue() {
                let totalDueSum = 0;
                $('.row-checkbox:checked').each(function() {
                    const dueAmount = parseFloat($(this).data('due')) || 0;
                    totalDueSum += dueAmount;
                });
                // $('#payment_balance').val(totalDueSum);
                 $('#Select_balance').html('Selected Due Amount: <span style="color: green;">' + totalDueSum + ' ৳</span>');

                return totalDueSum;
            }

                const addlLnk_payment = document.getElementById('add_link_payment');
                addlLnk_payment.addEventListener('click', function(e) {
                // console.log('Working on payment')
                e.preventDefault();

                let formData = new FormData($('.addLinkPaymentForm')[0]);
                const paymentAmount = parseFloat(formData.get('unused_amount')) || 0;
                const selectedSaleIds = [];
                const selectedTransactionIds = [];
                const totalDue = updateTotalDue();
                if (paymentAmount > totalDue) {
                    toastr.error(
                        `Payment amount (${paymentAmount}) cannot exceed total Selected due (${totalDue.toFixed(2)})`
                        );
                    return;
                }
                // Collect the sale_ids and transaction_ids from the checked checkboxes
                $('.row-checkbox:checked').each(function() {
                    const saleId = $(this).attr('sale_id');

                    const transactionId = $(this).attr('transaction_id');

                    // Only add to the array if the saleId or transactionId is not null
                    if (saleId && !selectedSaleIds.includes(saleId)) {
                        selectedSaleIds.push(saleId);
                    }

                    if (transactionId && !selectedTransactionIds.includes(transactionId)) {
                        selectedTransactionIds.push(transactionId);
                    }
                });

           const customerId = $('#linkDuePayment').data('customer-id');
            if (!customerId) {
                toastr.error('Customer ID is missing. Please try again.');
                return;
            }
                formData.append('sale_ids', JSON.stringify(selectedSaleIds));
                formData.append('transaction_ids', JSON.stringify(selectedTransactionIds));
                // CSRF Token setup
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });

                // AJAX request
                $.ajax({
                    url: '/party/due/link/invoice/payment/',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(res) {
                        // console.log(res);
                        if (res.status == 200) {
                            // Hide the correct modal
                            $('#linkDuePayment').modal('hide');
                            // Reset the form
                            $('.addLinkPaymentForm')[0].reset();
                            toastr.success(res.message);
                            window.location.reload();
                        } else if (res.status == 400) {
                            showError('.account', res.message);
                        } else {
                            // console.log(res);
                            if (res.error.payment_balance) {
                                showError('.payment_balance2', res.error.payment_balance);
                            }
                            if (res.error.account) {
                                showError('.account2', res.error.account);
                            }
                        }
                    },
                    error: function(err) {
                        toastr.error('An error occurred, Empty Feild Required.');
                    }
                });
            });
             });
</script>
