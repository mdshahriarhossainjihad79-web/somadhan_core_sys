<div class="col-md-12 grid-margin stretch-card">
    <div class="card">
        <div class="card-body">
            <h6 class="card-title text-info ">Party Statement Receive </h6>
            <div class="table-responsive">
                <table id="example" class="table">
                    <thead class="action">
                        <tr>
                            <th>SN</th>
                            <th>Party Name</th>
                            <th>Transaction Date & Time</th>
                            <th>Debit</th>
                            <th>Transaction Type</th>
                            <th>Note</th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>
                    </thead>
                    <tbody class="showData">
                        @if ($party_statements->count() > 0 && $party_statements->contains('reference_type', 'receive'))
                            @foreach ($party_statements->where('reference_type', 'receive') as $key => $party_statement)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $party_statement->customer->name }} | Type:
                                        {{ $party_statement->customer->party_type }}</td>
                                    @php
                                        $dacTimeZone = new DateTimeZone('Asia/Dhaka');
                                        $created_at = optional($party_statement->created_at)->setTimezone($dacTimeZone);
                                        $formatted_date = optional($party_statement->created_at)->format('d F Y') ?? '';
                                        $formatted_time = $created_at ? $created_at->format('h:i A') : '';
                                    @endphp
                                    <td>{{ $formatted_date ?? '-' }} <Span style="color:brown">:</Span>
                                        {{ $formatted_time ?? '-' }}</td>
                                    <td>{{ $party_statement->debit }}</td>
                                    <td>{{ $party_statement->reference_type }}</td>
                                    <td class="note_short">
                                        @php
                                            $note = $party_statement->note ?? 'N/A';
                                            $noteChunks = str_split($note, 20);
                                            echo implode('<br>', $noteChunks);
                                        @endphp
                                    </td>
                                    <td>
                                        @php
                                            $statusClass = match ($party_statement->status) {
                                                'used' => 'bg-success',
                                                'unused' => 'bg-danger',
                                                'partial' => 'bg-warning',
                                                default => 'bg-secondary',
                                            };
                                        @endphp
                                        <span class="badge {{ $statusClass }}">
                                            {{ ucfirst($party_statement->status) }}
                                        </span>
                                    </td>
                                    <td>
                                        @if ($party_statement->status === 'unused')
                                            <button type="button"
                                                class="btn btn-outline-primary btn-icon-text float-left add_money_modal"
                                                id="payment-btn" data-party-id="{{ $party_statement->party_id }}"
                                                data-statement-id="{{ $party_statement->id }}" data-bs-toggle="modal"
                                                data-bs-target="#linkDuePayment">
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
                                    </td>
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
<!-- individual Link Payment  Modal add Payment -->
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
                    <input type="hidden" name="party_id" value="">
                    <input type="hidden" name="statement_id" value="">
                    <input type="hidden" name="party_unused_amount" id="party_unused_amount" class="form-control">
                    <div class="mb-3 col-md-12">
                        <p class="" id="party_unused_balance"></p>
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

            const partyId = $(this).data('party-id'); //

            const statementId = $(this).data('statement-id'); //
            const $form = $('#addLinkPaymentForm');

            $form.find('input[name="party_id"]').val(partyId);
            $form.find('input[name="statement_id"]').val(statementId || '');
            const $modal = $('#linkDuePayment');
            $modal.data('party-id', partyId);
            $modal.data('statement_id', statementId || '');
            let url = `/get-due-party-invoice/${partyId}`;
            if (statementId) {
                url += `?statement_id=${statementId}`;
            }
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {

                    let tableBody = $('#DueinkInvoiceTable tbody');
                    tableBody.empty();

                    ///Unused Payment Start
                    $('#party_unused_balance').text(
                        response.unusedAmount ?
                        `Unused Amount: ${response.unusedAmount}` :
                        'Unused Amount: 0.00'
                    );
                    const unusedAmount = response.unusedAmount ?
                        parseFloat(response.unusedAmount) :
                        '0.00';
                    $('input[name="party_unused_amount"]').val(unusedAmount);
                    ///Unused Payment End
                    if (response) {
                        const openingDue = response.openingDue ?? 0;
                        const openingDueDate = response.openingDueDate ?? 0;
                        const openingDueId = response.openingDueId ?? 0;

                        // // Add opening due row if applicable//
                        if (openingDue > 0) {
                            const openingDueRow = `
                                    <tr>
                                        <td>
                                            <input type="checkbox" class="row-checkbox-party"
                                               opening_due_id="${openingDueId}"
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
                            tableBody.append(openingDueRow);
                            updateTotalDue()
                        }

                        // Add transaction rows
                        response.partyStatements.forEach(function(dueStatement) {
                            console.log(dueStatement.id);
                            let totalDue = 0;
                            let invoiceNumber = 'N/A';
                            let totalAmount = '';
                            let paidAmount = '';
                            let saleId = '';
                            let serviceSaledId = '';


                            if (dueStatement.sale) {
                                totalDue = (parseFloat(dueStatement.sale
                                        .grand_total) || 0) -
                                    (parseFloat(dueStatement.sale.paid) || 0);
                                invoiceNumber = dueStatement.sale.invoice_number ??
                                    'N/A';
                                totalAmount = dueStatement.sale.grand_total ?? 0;
                                paidAmount = dueStatement.sale.paid ?? 0;
                                saleId = dueStatement.sale.id ?? '';
                            } else if (dueStatement.service_sale) {
                                totalDue = (parseFloat(dueStatement.service_sale
                                    .due))
                                invoiceNumber = dueStatement.service_sale
                                    .invoice_number ?? 'N/A';
                                totalAmount = dueStatement.service_sale
                                    .grand_total ?? '';
                                paidAmount = dueStatement.service_sale.paid ?? '';
                                serviceSaledId = dueStatement.service_sale.id ?? '';
                            }

                            if (totalDue > 0) {
                                const row = `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="row-checkbox-party"

                                                    sale_id="${saleId}"
                                                    service_sale_id="${serviceSaledId}"
                                                    partyStatement_id="${dueStatement.id}"
                                                    data-due="${totalDue}">
                                            </td>
                                            <td>${dueStatement.date ?? ''}</td>
                                            <td>${dueStatement.reference_type ?? ''}</td>
                                            <td>${invoiceNumber}</td>
                                            <td>${totalAmount}</td>
                                            <td>${paidAmount}</td>
                                            <td>${totalDue}</td>
                                        </tr>
                                    `;
                                tableBody.append(row);
                                updateTotalDue()
                            }
                        });


                    } else {
                        console.log('No transactions found.');
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
            $('.row-checkbox-party').prop('checked', isChecked);
            updateTotalDue();

        });
        $(document).on('change', '.row-checkbox-party', function() {
            updateTotalDue();
        });

        function updateTotalDue() {
            let totalDueSum = 0;
            $('.row-checkbox-party:checked').each(function() {
                console.log('Selected');
                const dueAmount = parseFloat($(this).data('due')) || 0;
                totalDueSum += dueAmount;
            });
            // $('#payment_balance').val(totalDueSum);
            $('#Select_balance').html('Selected Due Amount: <span style="color: green;">' + totalDueSum +
                ' ৳</span>');

            return totalDueSum;

        }

        const addlLnk_payment = document.getElementById('add_link_payment');
        addlLnk_payment.addEventListener('click', function(e) {
            // console.log('Working on payment')
            e.preventDefault();

            let formData = new FormData($('.addLinkPaymentForm')[0]);
            const paymentAmount = parseFloat(formData.get('unused_amount')) || 0;
            const selectedSaleIds = [];
            const selectedServiceSaleIds = [];
            const selectedstatementIds = [];
            const openingSeectedDueId = [];
            const totalDue = updateTotalDue();
            if (paymentAmount > totalDue) {
                toastr.error(
                    `Payment amount (${paymentAmount}) cannot exceed total Selected due (${totalDue.toFixed(2)})`
                );
                return;
            }
            //--Collect the sale_ids and transaction_ids from the checked checkboxes--//
            $('.row-checkbox-party:checked').each(function() {
                const saleId = $(this).attr('sale_id');
                const openingDueId = $(this).attr('opening_due_id');
                const statementId = $(this).attr('partyStatement_id');
                const serviceSaleId = $(this).attr('service_sale_id');

                if (saleId && !selectedSaleIds.includes(saleId)) {
                    selectedSaleIds.push(saleId);
                }

                if (serviceSaleId && !selectedServiceSaleIds.includes(serviceSaleId)) {
                    selectedServiceSaleIds.push(serviceSaleId);
                }

                if (statementId && !selectedstatementIds.includes(statementId)) {
                    selectedstatementIds.push(statementId);
                }
                if (openingDueId && !openingSeectedDueId.includes(openingDueId)) {
                    openingSeectedDueId.push(openingDueId);
                }
            });

            const partyId = $('#linkDuePayment').data('party-id');

            if (!partyId) {
                toastr.error('Party ID is missing. Please try again.');
                return;
            }

            formData.append('sale_ids', JSON.stringify(selectedSaleIds));
            formData.append('statement_ids', JSON.stringify(selectedstatementIds));
            formData.append('serviceSale_ids', JSON.stringify(selectedServiceSaleIds));
            formData.append('opening_Due_id', JSON.stringify(openingSeectedDueId));
            // CSRF Token setup
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });

            // AJAX request
            $.ajax({
                url: '/party/due/individual/link/invoice/payment/',
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
