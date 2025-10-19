@extends('master')
@section('title', '| Transactions')

@section('admin')
    <style>
        .nav.nav-tabs .nav-item .nav-link.active {
            color: #010205 !important;
            background: rgb(101 209 209) !important;
        }

        .nav.nav-tabs .nav-item .nav-link {
            border-color: #090c0f #030406 #1a1d1f;
            color: #000;
            background-color: #6571ff;
            cursor: pointer;
        }
    </style>
    <link rel="stylesheet" type="text/css" media="print">

    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" id="profile-tab" data-bs-toggle="tab" href="#profile" style="background: "
                role="tab" aria-controls="profile" aria-selected="false">Balance Transfer</a>
        </li>


        <li class="nav-item">
            <a class="nav-link " id="receive-tab" data-bs-toggle="tab" href="#receive" role="tab"
                aria-controls="receive" aria-selected="true">Receive History</a>
        </li>
        <li class="nav-item">
            <a class="nav-link " id="payment-tab" data-bs-toggle="tab" href="#payment" role="tab"
                aria-controls="payment" aria-selected="true">Payment History</a>
        </li>
    </ul>
    <div class="tab-content border border-print border-top-0 p-3" id="myTabContent">

        <div class="tab-pane fade show active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
                <div class="col-md-12 stretch-card mt-1">
                    <div class="card">
                        <div class="card-body">
                            <div>
                                <h6 class="card-title text-info mb-0">Party Transaction</h6>

                            </div>
                            <form id="myValidForm" action="{{ route('party.statement.store') }}" method="post">
                                @csrf
                                <div id="linked-invoices"></div>
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="mb-3 form-valid-groups">
                                            <label class="form-label">Transaction Date<span
                                                    class="text-danger">*</span></label>
                                            <div class="input-group flatpickr" id="flatpickr-date">
                                                <input type="date" id="datepicker" name="date"
                                                    class="form-control active" placeholder="Select date">
                                                <span class="input-group-text input-group-addon" data-toggle><i
                                                        data-feather="calendar"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 d-none" id="investment-col">
                                        <div class="mb-3 form-valid-groups">
                                            <label class="form-label">Purpose <span class="text-danger">*</span></label>
                                            <select class="form-select " data-width="100%" name="type" id="due-payment"
                                                aria-invalid="false">
                                                <option selected value="due-payment">Due Payment</option>
                                            </select>
                                        </div>
                                    </div><!-----Col ----->
                                    <div class="col-sm-6 d-none">
                                        <div class="mb-3 form-valid-groups ">
                                            <label class="form-label">Account Type<span class="text-danger">*</span></label>
                                            <select class="form-select" data-width="100%" name="account_type"
                                                id="account_type" aria-invalid="false">
                                                <option selected value="party">Party</option>
                                            </select>
                                        </div>
                                    </div><!---- Col ---->
                                    <div class="col-sm-6">
                                        <div class="mb-3 form-valid-groups">
                                            <label class="form-label">Transaction Type <span
                                                    class="text-danger">*</span></label>
                                            <select class="form-select  bank_id" data-width="100%" name="transaction_type"
                                                style="background: transparent" id="transaction_type" aria-invalid="false">
                                                <option selected="" disabled value="">Select Type</option>
                                                <option value="receive">Cash Receive</option>
                                                <option value="pay">Cash Payment</option>
                                            </select>
                                        </div>
                                    </div><!-- Col -->
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="col-md-12">
                                            <div class="mb-3">
                                                <label class="form-label">Party Name<span
                                                        class="text-danger">*</span></label>
                                                <select class="form-select js-example-basic-single select-account-id"
                                                    data-width="100%" name="account_id" id="account_id"
                                                    aria-invalid="false">
                                                    <option selected disabled value="">Select Name </option>
                                                </select>
                                            </div>
                                            <div id="party_name" style="margin-top:10px;"></div>
                                            <div id="total_due"></div>
                                        </div><!-- Col -->

                                    </div>
                                    @php
                                        $paymentMethod = App\Models\Bank::latest()->get();
                                    @endphp
                                    <div class="col-sm-6">
                                        <div class="mb-3">
                                            <label class="form-label">Transaction Account <span
                                                    class="text-danger">*</span> <span class="applied"></span></label>
                                            <select class="compose-multiple-select form-select"
                                                data-placeholder="Select Account" data-width="100%" multiple="multiple"
                                                name="payment_method[]" id="payment_method" aria-invalid="false">
                                                @foreach ($paymentMethod as $payment)
                                                    <option value="{{ $payment->id }}">{{ $payment->name }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                    </div>

                                    <div class="col-sm-6">

                                        <div id="amount-inputs" class="mt-2"></div>
                                    </div>

                                    <div class="col-sm-12">
                                        <div class="mb-3">
                                            <label class="form-label">Note</label>
                                            <textarea name="note" class="form-control" placeholder="Write Note (Optional)" rows="4" cols="50"></textarea>
                                        </div>
                                    </div><!-- Col -->
                                </div><!-- Row -->
                              <div class="d-flex ">
                                  <div class="mx-4">
                                    <input type="submit" class="btn btn-primary submit" value="Payment">
                                </div>
                                  <div>
                                             <button type="button"
                                        class="btn btn-outline-primary btn-icon-text float-left add_single_money_modal"
                                        id="single-payment-btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#linkSingleDuePayment">
                                        <i class="btn-icon-prepend"
                                            data-feather="credit-card"></i>
                                        link Payment
                                    </button>
                                        </div>
                              </div>
                            </form>

                            <table>
                                <tbody id="account_data">
                                    <!-- Data will be dynamically populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <!---//-----------------------Transaction Store/Add  End---------------------//-->
        <!---//-----------------------Transaction Receive---------------------//-->

        <div class="tab-pane fade show " id="receive" role="tabpanel" aria-labelledby="receive-tab">
            <div id="transaction-filter-rander">
                    @include('pos.party.party_payment_receive_history')
        </div>
        </div>
        <!---//-----------------------Transaction Payment---------------------//-->
        <div class="tab-pane fade show " id="payment" role="tabpanel" aria-labelledby="payment-tab">
            <div id="transaction-filter-rander">
                     @include('pos.party.party_payment_pay_history')
        </div>
        </div>
    </div> <!--//Main tab End-->

 <!--Link Payment Single  Modal add Payment Start -->
    <div class="modal fade" id="linkSingleDuePayment" tabindex="-1" aria-labelledby="exampleModalScrollableTitle2"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalScrollableTitle2">Link Due Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
                </div>
                <div class="modal-body">
                    <form id="addLinkPaymentForm2" class="addLinkPaymentForm2 row" method="POST">
                        <div class="mb-3 col-md-12">
                            <p class="" id="Select_balance"></p>
                        </div>
                        <div class="link-invoice">
                            <table id="DueSinglelinkInvoiceTable" class="table table-bordered align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th><input type="checkbox" id="selectAllSingle"></th>
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
                    <a type="button" class="btn btn-primary" id="link_due_apply">Apply</a>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script>
        $(document).ready(function() {

            $(document).on('change', '.select-account-id', function() {
                let accountId = this.value;

                let account_type = document.querySelector('#account_type').value;

                $.ajax({
                    url: '/get/due/party/data',
                    method: 'GET',
                    data: {
                        id: accountId,
                        account_type
                    },
                    success: function(data) {
                        $('#party_name').text('Party Name: ' + data.info.name + ' Party Type:' +
                            data.info.party_type)
                        $('#account-details').text('Type:' + data.info.party_type)
                        if (data.info.wallet_balance > 0) {
                            $('#total_due').text(
                                `Total Due Amount: ${data.info.wallet_balance}`);
                        } else if (data.info.wallet_balance < 0) {
                            $('#total_due').text(
                                `Total Return Amount: ${data.info.wallet_balance}`);
                        } else {
                            $('#total_due').text('Total Due Amount: 0');
                        }
                        $('.account-info').show();
                        // Fetch and populate due transactions for the selected customer
                let url = `/get-party-transaction-due-invoice/${accountId}`;
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function(response) {
                        console.log(response)
                        let tableBody = $('#DueSinglelinkInvoiceTable tbody');
                        tableBody.empty();
                        // Populate table with due transactions

                        if (response) {
                            const openingDue = response.openingDue ?? 0;
                            const openingDueDate = response.openingDueDate ?? 0;
                            const openingDueId = response.openingDueId ?? 0;

                            // // Add opening due row if applicable//
                            if (openingDue > 0) {
                                const openingDueRow = `
                                    <tr>
                                        <td>
                                            <input type="checkbox" class="row-checkbox"
                                                partyStatement_id="${openingDueId}"
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
                                    totalDue = (parseFloat(dueStatement.sale.grand_total) || 0) -
                                            (parseFloat(dueStatement.sale.paid) || 0);
                                    invoiceNumber = dueStatement.sale.invoice_number ?? 'N/A';
                                    totalAmount = dueStatement.sale.grand_total ?? '';
                                    paidAmount = dueStatement.sale.paid ?? '';
                                    saleId = dueStatement.sale.id ?? '';
                                } else if (dueStatement.service_sale) {
                                    totalDue = (parseFloat(dueStatement.service_sale.due))
                                    invoiceNumber = dueStatement.service_sale.invoice_number ?? 'N/A';
                                    totalAmount = dueStatement.service_sale.grand_total ?? '';
                                    paidAmount = dueStatement.service_sale.paid ?? '';
                                    serviceSaledId = dueStatement.service_sale.id ?? '';
                                }

                                if (totalDue > 0) {
                                    const row = `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="row-checkbox"

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

                    updateTotalDue()
                        } else {
                            console.log('No transactions found.');
                        }
                    },
                    error: function() {
                        console.error('Failed to fetch transactions.');
                    }
                });
                    },
                    error: function(xhr, status, error) {
                        console.error('Due Payment Request failed:', error);
                    }
                });

            });
    $('#link_due_apply').on('click', function () {
        let selectedInvoices = [];
    toastr.info('Applied', 'Link Due Payment', {
        timeOut: 3000, // Display for 3 seconds
        closeButton: true,
        progressBar: true
    });
        $('.row-checkbox:checked').each(function () {
            let invoiceData = {
                partyStatementId: $(this).attr('partyStatement_id'),
                saleId: $(this).attr('sale_id') || '',
                serviceSaleId: $(this).attr('service_sale_id') || '',
                dueAmount: $(this).data('due')
            };
            selectedInvoices.push(invoiceData);
            updateTotalDue()
        });

        // Clear previous hidden inputs
        $('#linked-invoices').empty();

        // Add hidden inputs for each selected invoice
        selectedInvoices.forEach(function (invoice, index) {
            $('#linked-invoices').append(`
                <input type="hidden" name="linked_invoices[${index}][party_statement_id]" value="${invoice.partyStatementId}">
                <input type="hidden" name="linked_invoices[${index}][sale_id]" value="${invoice.saleId}">
                <input type="hidden" name="linked_invoices[${index}][service_sale_id]" value="${invoice.serviceSaleId}">
                <input type="hidden" name="linked_invoices[${index}][due_amount]" value="${invoice.dueAmount}">
            `);
        });

        // Close modal
        $('#linkSingleDuePayment').modal('hide');
    });
            /////Validation////
            $('#myValidForm').validate({
                rules: {
                    account_type: {
                        required: true,
                    },
                    transaction_type: {
                        required: true,
                    },
                    date: {
                        required: true,
                    },
                    balance: {
                        required: true,
                    },
                    payment_method: {
                        required: true,
                    },
                    amount: {
                        required: true,
                    },
                    type: {
                        required: true,
                    },
                },
                messages: {
                    account_type: {
                        required: 'Please Select Account Type',
                    },
                    date: {
                        required: 'Please Select Date',
                    },
                    transaction_type: {
                        required: 'Please Select Transaction Type',
                    },
                    balance: {
                        required: 'Enter Transaction Balance',
                    },
                    payment_method: {
                        required: 'Select Payment Method',
                    },
                    amount: {
                        required: 'Enter Amount',
                    },
                    type: {
                        required: 'Enter Amount',
                    },
                },
                errorElement: 'span',
                errorPlacement: function(error, element) {
                    error.addClass('invalid-feedback');
                    element.closest('.form-valid-groups').append(error);
                },
                highlight: function(element, errorClass, validClass) {
                    $(element).addClass('is-invalid');
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).removeClass('is-invalid');
                    $(element).addClass('is-valid');
                },
            });
        });

        function showError(name, message) {
            $(name).css('border-color', 'red');
            $(name).focus();
            $(`${name}_error`).show().text(message);
        }

        function errorRemove(element) {
            tag = element.tagName.toLowerCase();
            if (element.value != '') {
                // console.log('ok');
                if (tag == 'select') {
                    $(element).closest('.mb-3').find('.text-danger').hide();
                } else {
                    $(element).siblings('span').hide();
                    $(element).css('border-color', 'green');
                }
            }
        }
        // Function to fetch and display parties
        function viewParty() {
            $.ajax({
                url: '/get/party',
                method: 'GET',
                success: function(res) {
                    const partys = res.allData;
                    const selectAccountId = $('.select-account-id');
                    selectAccountId.empty();
                    selectAccountId.append('<option selected disabled value="">Select Name </option>');
                    if (partys.length > 0) {
                        $.each(partys, function(index, party) {
                            selectAccountId.append(
                                `<option value="${party.id}">${party.name} (${party.phone}) (${party.party_type})</option>`
                            );
                        });
                    }

                }
            });
        }
        flatpickr("#datepicker", {
            maxDate: "today",
            disable: []
        });

        viewParty()
        // Replace the #payment_method event handler
        $(document).ready(function() {

            $('#payment_method').on('change', function() {
                // console.log('payment_method changed');
                const selectedOptions = $(this).find('option:selected');

                const amountInputsContainer = $('#amount-inputs');
                const existingInputs = amountInputsContainer.find('.amount-input-group');
                const selectedIds = selectedOptions.map(function() {
                    return $(this).val();
                }).get();
                // Remove inputs for deselected accounts
                existingInputs.each(function() {
                    const accountId = $(this).data('account-id');
                    if (!selectedIds.includes(accountId.toString())) {
                        console.log('Removing input for account ID:', accountId);
                        $(this).remove();
                    }
                });

                // Add inputs for newly selected accounts
                selectedOptions.each(function() {
                    const accountId = $(this).val();
                    const accountName = $(this).text().trim();
                    if (!amountInputsContainer.find(
                            `.amount-input-group[data-account-id="${accountId}"]`).length) {
                        console.log('Adding input for account ID:', accountId);
                        const inputHtml = `
                <div class="mb-2 amount-input-group" data-account-id="${accountId}">
                    <label class="form-label">Amount for ${accountName}</label>
                    <input type="number" class="form-control amount-input" name="amounts[${accountId}]" placeholder="Enter amount" min="0" step="0.01" required>
                </div>
            `;
                        amountInputsContainer.append(inputHtml);
                    }
                });
            });
        });

        //////
         /////////////////Single Link payment Start///////////////////

            // Handle "Select All" checkbox
            $('#selectAllSingle').on('click', function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox').prop('checked', isChecked);
                updateTotalDue();

            });
             function updateTotalDue() {
                let totalDueSum = 0;
                $('.row-checkbox:checked').each(function() {
                    const dueAmount = parseFloat($(this).data('due')) || 0;
                    console.log(dueAmount)
                    totalDueSum += dueAmount;
                });
                // $('#payment_balance').val(totalDueSum);
                 $('#Select_balance').html('Selected Due Amount: <span style="color: green;">' + totalDueSum + ' ৳</span>');
                 $('#link_due_apply').on('click', function () {
                     $('.applied').html('Selected Link Amount: <span style="color: green;">' + totalDueSum + ' ৳</span>');
                 })


                return totalDueSum;
            }
updateTotalDue()
    </script>

    <style>
        @media print {

            nav,
            .nav,
            .footer {
                display: none !important;
            }

            .page-content {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }

            .btn_group,
            .filter_table,
            .dataTables_length,
            .pagination,
            .dataTables_info {
                display: none !important;
            }

            #dataTableExample_filter {
                display: none !important;
            }

            .border {
                border: none !important;
            }

            table,
            th,
            td {
                border: 1px solid black;
                background: #fff
            }

            .actions {
                display: none !important;
            }

            .card {
                background: #fff !important;
                box-shadow: none !important;
                border: none !important;
            }

            .note_short {}
        }
    </style>
@endsection
