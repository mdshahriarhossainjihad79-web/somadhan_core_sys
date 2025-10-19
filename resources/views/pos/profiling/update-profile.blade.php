@extends('master')
@section('title')
@endsection
@section('admin')
    <nav class="page-breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">

            </li>
        </ol>
    </nav>

    <div class="row">
        <div class="col-md-12 grid-margin stretch-card">
            <div class="card border-0 shadow-none">
                <div class="card-body">
                    <div class="container-fluid d-flex justify-content-between">
                        <div class="col-lg-3 ps-0">
                            @if (!empty($invoice_logo_type))
                                @if ($invoice_logo_type == 'Name')
                                    <a href="#" class="noble-ui-logo logo-light d-block mt-3">{{ $siteTitle }}</a>
                                @elseif($invoice_logo_type == 'Logo')
                                    @if (!empty($logo))
                                        <img class="margin_left_m_14" height="100" width="200"
                                            src="{{ url($logo) }}" alt="logo">
                                    @else
                                        <p class="mt-1 mb-1 show_branch_name"><b>{{ $siteTitle }}</b></p>
                                    @endif
                                @elseif($invoice_logo_type == 'Both')
                                    @if (!empty($logo))
                                        <img class="margin_left_m_14" height="90" width="150"
                                            src="{{ url($logo) }}" alt="logo">
                                    @endif
                                    <p class="mt-1 mb-1 show_branch_name"><b>{{ $siteTitle }}</b></p>
                                @endif
                            @else
                                <a href="#" class="noble-ui-logo logo-light d-block mt-3">EIL<span>Electro</span></a>
                            @endif
                            <hr>
                            <p class="show_branch_address">{{ $branch->address ?? '' }}</p>
                            <p class="show_branch_email">{{ $branch->email ?? '' }}</p>
                            <p class="show_branch_phone">{{ $branch->phone ?? '' }}</p>
                        </div>
                        <div>
                            @if ($data->party_type === 'customer' || $data->party_type === 'both')
                                {{-- @if ($link_invoice_payment == 1)
                                    <button type="button"
                                        class="btn btn-outline-primary btn-icon-text float-left add_money_modal"
                                        id="payment-btn" data-bs-toggle="modal" data-bs-target="#linkDuePayment">
                                        <i class="btn-icon-prepend" data-feather="credit-card"></i>
                                        link Due Payment
                                    </button>
                                @endif --}}
                            @endif
                            @if ($invoice_payment == 1)
                                <button type="button"
                                    class="btn btn-outline-primary btn-icon-text float-left add_money_modal"
                                    id="payment-btn" data-bs-toggle="modal" data-bs-target="#duePayment">
                                    <i class="btn-icon-prepend" data-feather="credit-card"></i>
                                    Payment
                                </button>
                            @endif
                            <button type="button"
                                class="btn btn-outline-primary btn-icon-text me-2 mb-2 mb-md-0 print-btn">
                                <i class="btn-icon-prepend" data-feather="printer"></i>
                                Print
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body show_ledger">
                    <div class="container-fluid w-100">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <td>Account Of</td>
                                                <td>{{ $data->name ?? '' }}</td>
                                                <td>Address</td>
                                                <td>{{ $data->address ?? '' }}</td>
                                                <td>Contact No.</td>
                                                <td>{{ $data->phone ?? '' }}</td>
                                                <td>Email</td>
                                                <td>{{ $data->email ?? '' }}</td>
                                                <td>Party Type</td>
                                                <td>{{ $data->party_type ?? '' }}</td>
                                                <td>Branch Name</td>
                                                <td>{{ $branch->name ?? '' }}</td>
                                            </tr>
                                            <tr>
                                                <td>Opening Receivable </td>
                                                <td>{{ $data->opening_receivable ?? 0 }}</td>

                                                <td>Total Receivable</td>
                                                <td>{{ $data->total_receivable ?? '' }}</td>
                                                <td>Total Payable</td>
                                                <td>{{ $data->total_payable ?? '' }}</td>
                                                <td>Total Debit</td>
                                                <td>{{ $data->total_debit ?? 0 }}</td>
                                                <td>Total Credit</td>
                                                <td>{{ $data->total_credit ?? 0 }}</td>
                                                <td>Wallet Balance</td>
                                                <td style="color: {{ $data->wallet_balance > 0 ? 'red' : 'green' }}">
                                                    {{ $data->wallet_balance ?? '' }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>

                                        </thead>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h4 class="my-3 text-center">
                        @if ($data->party_type === 'customer')
                            Customer
                        @elseif($data->party_type === 'supplier')
                            Supplier
                        @else
                            Party
                        @endif Ledger
                    </h4>
                    <div class="container-fluid w-100">
                        <div class="row">
                            <!-- //First col Start -->
                            @php

                                $totalDebit = 0;
                                $totalCredit = 0;
                            @endphp

                            <div class="col-md-12">

                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Invoice</th>
                                                <th>Particulars</th>
                                                <th>Grand Total</th>
                                                <th>Debit</th>
                                                <th>Credit</th>
                                                <th>Status</th>
                                                <th class="id">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @if ($party_statements->count() > 0)
                                                @foreach ($party_statements as $party_statement)
                                                    @php
                                                        $totalDebit += $party_statement->debit ?? 0;
                                                        $totalCredit += $party_statement->credit ?? 0;
                                                    @endphp
                                                    <tr>
                                                        <td> {{ \Carbon\Carbon::parse($party_statement->date)->format('F j, Y') ?? 'N/A' }}
                                                        </td>
                                                        <!-----Invoice No----->
                                                        <td>
                                                            @if ($party_statement->reference_type == 'sale')
                                                                <a
                                                                    href="{{ route('sale.invoice', $party_statement->reference_id) }}">
                                                                    #{{ $party_statement->sale->invoice_number ?? 'N/A' }}
                                                                </a>
                                                            @elseif($party_statement->reference_type == 'purchase')
                                                                <a
                                                                    href="{{ route('purchase.invoice', $party_statement->reference_id) }}">
                                                                    #{{ $party_statement->purchase->invoice ?? 'N/A' }}
                                                                </a>
                                                            @elseif($party_statement->reference_type == 'return')
                                                                <a
                                                                    href="{{ route('return.products.invoice', $party_statement->reference_id) }}">
                                                                    #{{ $party_statement->return->return_invoice_number ?? 'N/A' }}
                                                                </a>
                                                            @elseif($party_statement->reference_type == 'service_sale')
                                                                <a
                                                                    href="{{ route('service.sale.invoice', $party_statement->reference_id) }}">
                                                                    #{{ $party_statement->service_sale->invoice_number ?? 'N/A' }}
                                                                </a>
                                                            @else
                                                                N/A
                                                            @endif
                                                        </td>
                                                        <td>
                                                            @if ($party_statement->reference_type == 'service_sale')
                                                                <span>Service Sale</span>
                                                            @elseif ($party_statement->reference_type == 'opening_due')
                                                                <span>Opening Due</span>
                                                            @else
                                                                {{ $party_statement->reference_type }}
                                                            @endif
                                                        </td>
                                                        <td>
                                                            @if ($party_statement->reference_type == 'sale')
                                                                {{ $party_statement->sale->grand_total ?? 'N/A' }}
                                                            @elseif($party_statement->reference_type == 'purchase')
                                                                {{ $party_statement->purchase->grand_total ?? 'N/A' }}
                                                            @elseif($party_statement->reference_type == 'return')
                                                                {{ $party_statement->return->refund_amount ?? 'N/A' }}
                                                            @elseif($party_statement->reference_type == 'service_sale')
                                                                {{ $party_statement->service_sale->grand_total ?? 'N/A' }}
                                                            @else
                                                                N/A
                                                            @endif
                                                        </td>
                                                        <td> {{ $party_statement->debit }}</td>
                                                        <td>{{ $party_statement->credit }}</td>
                                                        <!-----Status----->
                                                        <td>
                                                            @php
                                                                $status = 'N/A';
                                                                $badgeClass = 'secondary';

                                                                if (
                                                                    $party_statement->reference_type == 'sale' &&
                                                                    $party_statement->sale
                                                                ) {
                                                                    if ($party_statement->sale->status == 'paid') {
                                                                        $status = 'Paid';
                                                                        $badgeClass = 'success';
                                                                    } elseif (
                                                                        $party_statement->sale->status == 'unpaid'
                                                                    ) {
                                                                        $status = 'Unpaid';
                                                                        $badgeClass = 'danger';
                                                                    } elseif (
                                                                        $party_statement->sale->status == 'partial'
                                                                    ) {
                                                                        $status = 'Partial';
                                                                        $badgeClass = 'primary';
                                                                    } else {
                                                                        $status =
                                                                            $party_statement->sale->status ?? 'N/A';
                                                                    }
                                                                } elseif (
                                                                    $party_statement->reference_type == 'purchase' &&
                                                                    $party_statement->purchase
                                                                ) {
                                                                    $status =
                                                                        $party_statement->purchase->payment_status ??
                                                                        'N/A';
                                                                    if ($status == 'paid') {
                                                                        $badgeClass = 'success';
                                                                    } elseif ($status == 'unpaid') {
                                                                        $badgeClass = 'danger';
                                                                    } elseif ($status == 'partial') {
                                                                        $badgeClass = 'primary';
                                                                    } else {
                                                                        $badgeClass = 'secondary';
                                                                    }
                                                                } elseif (
                                                                    $party_statement->reference_type ==
                                                                        'service_sale' &&
                                                                    $party_statement->service_sale
                                                                ) {
                                                                    $status =
                                                                        $party_statement->service_sale->status ?? 'N/A';
                                                                    if ($status == 'paid') {
                                                                        $badgeClass = 'success';
                                                                    } elseif ($status == 'pending') {
                                                                        $badgeClass = 'warning';
                                                                    } elseif ($status == 'approved') {
                                                                        $badgeClass = 'primary';
                                                                    } elseif ($status == 'processing') {
                                                                        $badgeClass = 'info';
                                                                    } else {
                                                                        $badgeClass = 'secondary';
                                                                    }
                                                                } elseif (
                                                                    $party_statement->reference_type == 'receive'
                                                                ) {
                                                                    $party_statement->status;
                                                                } elseif (
                                                                    $party_statement->reference_type == 'return' &&
                                                                    $party_statement->return
                                                                ) {
                                                                    $status = 'N/A';
                                                                    $badgeClass = 'secondary';
                                                                }
                                                            @endphp
                                                            <span
                                                                class="badge bg-{{ $badgeClass }}">{{ ucfirst($status) }}</span>
                                                        </td>
                                                        <!-----Action----->
                                                        <td class="id">
                                                            @if ($party_statement->reference_type == 'sale')
                                                                <a href="{{ route('sale.edit', $party_statement->reference_id) }}"
                                                                    class= " btn btn-sm btn-outline-primary float-center"
                                                                    data-id="{{ $party_statement->reference_id }}"
                                                                    type="sale">
                                                                    Edit
                                                                </a>
                                                            @elseif($party_statement->reference_type == 'receive')
                                                                @if ($party_statement->status === 'unused')
                                                                    <button type="button"
                                                                        class="btn btn-outline-primary btn-icon-text float-left add_money_modal_single"
                                                                        id="payment-btn"
                                                                        data-party-id="{{ $party_statement->party_id }}"
                                                                        data-statement-id="{{ $party_statement->id }}"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#linkDuePayment">
                                                                        <i class="btn-icon-prepend"
                                                                            data-feather="credit-card"></i>
                                                                        link Payment
                                                                    </button>
                                                                @else
                                                                    <button type="button"
                                                                        class="btn btn-outline-primary btn-icon-text float-left ">
                                                                        <i class="btn-icon-prepend"
                                                                            data-feather="credit-card"></i>
                                                                        Used
                                                                    </button>
                                                                @endif
                                                            @elseif($party_statement->reference_type == 'purchase')
                                                                <a href="{{ route('purchase.edit', $party_statement->reference_id) }}"
                                                                    class= " btn btn-sm btn-outline-primary float-center"
                                                                    data-id="{{ $party_statement->reference_id }}"
                                                                    type="sale">
                                                                    Edit
                                                                </a>
                                                            @else
                                                                <span class="badge bg-secondary ">N/A</span>
                                                            @endif
                                                        </td>
                                                    </tr>
                                                @endforeach
                                                @php

                                                @endphp
                                                <tr>
                                                    <td class="id"></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Total</td>
                                                    <td> {{ number_format($totalDebit, 2) }}</td>
                                                    <td> {{ number_format($totalCredit, 2) }}</td>
                                                </tr>
                                            @else
                                                <tr>
                                                    <td colspan="7" class="text-center">No Data Found</td>
                                                </tr>
                                            @endif


                                        </tbody>

                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <iframe id="printFrame" src="" width="0" height="0"></iframe>
    <!-- Modal add Payment -->
    <div class="modal fade" id="duePayment" tabindex="-1" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalScrollableTitle">Due Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
                </div>
                <div class="modal-body">
                    <form id="addPaymentForm" class="addPaymentForm row" method="POST">
                        <input type="hidden" name="data_id" id="data_id" value="{{ $data->id }}">
                        <input type="hidden" name="isCustomer" value="{{ $data->party_type }}">
                        <div>
                            <label for="name" class="form-label">Total Due Amount : <span id="due-amount">
                                    {{ number_format($data->wallet_balance, 2) }}</span> ৳ </label> <br>
                            <label for="remaining" class="form-label">Remaining Due:
                                <span class="text-danger" id="remaining-due">
                                    {{ number_format($data->wallet_balance, 2) }} </span>৳
                            </label>

                        </div>
                        <div class="mb-3 col-md-6">
                            <label for="name" class="form-label">Balance Amount <span
                                    class="text-danger">*</span></label>
                            <input type="number" class="form-control add_amount payment_balance" name="payment_balance"
                                onkeyup="dueShow()" onkeydown="errorRemove(this);">
                            <span class="text-danger payment_balance_error"></span>
                        </div>

                        <div class="mb-3 col-md-6">
                            <label for="name" class="form-label">Transaction Account <span
                                    class="text-danger">*</span></label>
                            <select class="form-control account" name="account" id=""
                                onchange="errorRemove(this);">
                                @foreach ($banks as $bank)
                                    <option value="{{ $bank->id }}">{{ $bank->name }}</option>
                                @endforeach
                            </select>
                            <span class="text-danger account_error"></span>
                        </div>


                        @if ($data->party_type === 'customer' || $data->party_type === 'both')
                            <div class="link-invoice">
                                <table id="transactionTable" class="table table-bordered align-middle">
                                    <thead class="table-light">

                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>

                            </div>
                        @endif
                        <div class="mb-3 col-md-12">
                            <label for="name" class="form-label">Note</label>
                            <textarea name="note" class="form-control note" id="" placeholder="Enter Note (Optional)"
                                rows="3"></textarea>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <a type="button" class="btn btn-primary" id="add_payment">Payment</a>
                </div>
            </div>
        </div>
    </div>
    <!--Link Payment Multiple  Modal add Payment -->
    {{-- <div class="modal fade" id="linkDuePayment" tabindex="-1" aria-labelledby="exampleModalScrollableTitle1"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalScrollableTitle1">Link Due Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
                </div>
                <div class="modal-body">
                    <form id="addLinkPaymentForm" class="addLinkPaymentForm row" method="POST">
                        <input type="hidden" name="data_id" id="data_id" value="{{ $data->id }}">
                        <input type="hidden" name="isCustomer" value="{{ $data->party_type }}">
                        <input type="hidden" name="due_amount" value="{{ $data->wallet_balance }}">

                        @if ($data->party_type === 'customer' || $data->party_type === 'both')
                            <h6 class="pb-2" id="unused_balance">Selected Unused Amount : 0</h6>
                            <label for="name" class="form-label">Total Avaliable Unused : <span id="unused-amount">
                                    {{ number_format($totalUnusedBalance, 2) }}</span> ৳ </label> <br>
                            <div class="">
                                <table id="unpaidStatusTable" class="table table-bordered align-middle">
                                    <thead class="table-light">
                                        <tr>
                                            <th><input type="checkbox" id="selectAll2"></th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                    </tbody>
                                </table>
                            </div>
                        @endif


                        <div class="mb-3 col-md-12">
                            <label for="name" class="form-label">Balance Amount <span
                                    class="text-danger">*</span></label>
                            <input type="number" class="form-control add_amount  payment_balance2" readonly
                                id="payment_balance" name="payment_balance" onkeydown="errorRemove(this);">
                            <span class="text-danger payment_balance2_error"></span>
                            <p class="" id="Select_balance"></p>
                        </div>

                        @if ($data->party_type === 'customer' || $data->party_type === 'both')
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
                        @endif
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <a type="button" class="btn btn-primary" id="add_link_payment">Apply Unused Payment</a>
                </div>
            </div>
        </div>
    </div> --}}
    <!--Link Payment Multiple  Modal add Payment End -->
    <!--Link Payment Single  Modal add Payment Start -->
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
    <!--Link Payment Single  Modal add Payment End -->

    <style>
        #printFrame {
            display: none;
            /* Hide the iframe */
        }

        .table> :not(caption)>*>* {
            padding: 0px 10px !important;
        }

        .margin_left_m_14 {
            margin-left: -14px;
        }

        .w_40 {
            width: 250px !important;
            text-wrap: wrap;
        }

        @media print {
            .page-content {
                margin-top: 0 !important;
                padding-top: 0 !important;
                min-height: 740px !important;
                background-color: #ffffff !important;
            }

            .grid-margin,
            .card,
            .card-body,
            table {
                background-color: #ffffff !important;
                color: #000 !important;
            }

            .footer_invoice p {
                font-size: 12px !important;
            }

            button,
            .filter_box,
            nav,
            .footer,
            .id,
            .dataTables_filter,
            .dataTables_length,
            .dataTables_info {
                display: none !important;
            }
        }
    </style>

    <script>
        // Error Remove Function
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

        // Show Error Function
        function showError(payment_balance, message) {
            $(payment_balance).css('border-color', 'red');
            $(payment_balance).focus();
            $(`${payment_balance}_error`).show().text(message);
        }

        // due Showj
        function dueShow() {
            let dueAmountText = document.getElementById('due-amount').innerText.trim();
            let dueAmount = parseFloat(dueAmountText.replace(/[^\d.-]/g, ''));

            let paymentBalanceText = document.querySelector('.payment_balance').value.trim();
            let paymentBalance = parseFloat(paymentBalanceText)

            let remainingDue = dueAmount - (paymentBalance || 0);
            document.getElementById('remaining-due').innerText = remainingDue.toFixed(2) ?? 0 + ' ৳';

        }


        function totalUnusedAmount() {
            let dueAmountText = document.getElementById('link_due-amount').innerText.trim();
            let dueAmount = parseFloat(dueAmountText.replace(/[^\d.-]/g, ''));
            let paymentBalanceText = document.querySelector('.payment_balance2').value.trim();
            let paymentBalance = parseFloat(paymentBalanceText)
            let remainingDue = dueAmount - (paymentBalance || 0);
            document.getElementById('remaining-due2').innerText = remainingDue.toFixed(2) ?? 0 + ' ৳';

        }

        const savePayment = document.getElementById('add_payment');
        savePayment.addEventListener('click', function(e) {
            // console.log('Working on payment')
            e.preventDefault();

            let formData = new FormData($('.addPaymentForm')[0]);
            // CSRF Token setup
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            // AJAX request
            $.ajax({
                url: '/due/invoice/payment/transaction',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(res) {
                    // console.log(res);
                    if (res.status == 200) {
                        // Hide the correct modal //
                        $('#duePayment').modal('hide');
                        // Reset the form
                        $('.addPaymentForm')[0].reset();
                        toastr.success(res.message);
                        window.location.reload();
                    } else if (res.status == 400) {
                        showError('.account', res.message);
                    } else {
                        // console.log(res);
                        if (res.error.payment_balance) {
                            showError('.payment_balance', res.error.payment_balance);
                        }

                        if (res.error.account) {
                            showError('.account', res.error.account);
                        }
                    }
                },
                error: function(err) {
                    toastr.error('An error occurred, Empty Feild Required.');
                }
            });
        });


        // print
        document.querySelector('.print-btn').addEventListener('click', function(e) {
            e.preventDefault();
            if ($.fn.DataTable.isDataTable('#example')) {
                $('#example').DataTable().destroy();
            }
            $('#dataTableExample').removeAttr('id');
            $('.table-responsive').removeAttr('class');
            // Trigger the print function
            window.print();
        });

        $('.print').click(function(e) {
            e.preventDefault();
            let id = $(this).attr('data-id');
            let type = $(this).attr('type');
            var printFrame = $('#printFrame')[0];

            if (type == 'sale') {
                var printContentUrl = '/sale/invoice/' + id;
            } else if (type == 'return') {
                var printContentUrl = '/return/products/invoice/' + id;
            } else if (type == 'purchase') {
                var printContentUrl = '/purchase/invoice/' + id;
            } else {
                var printContentUrl = '/transaction/invoice/receipt/' + id;
            }

            $('#printFrame').attr('src', printContentUrl);
            printFrame.onload = function() {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            };
        })

        //Via Sale Add Payment
        $(document).ready(function() {

            //Link Invoice Payment Multiple End//
            /////////////////Single Link payment Start///////////////////

            $(document).ready(function() {

                $('.add_money_modal_single').on('click', function() {
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
                                response.partyStatements.forEach(function(
                                    dueStatement) {
                                    console.log(dueStatement.id);
                                    let totalDue = 0;
                                    let invoiceNumber = 'N/A';
                                    let totalAmount = '';
                                    let paidAmount = '';
                                    let saleId = '';
                                    let serviceSaledId = '';


                                    if (dueStatement.sale) {
                                        totalDue = (parseFloat(dueStatement.sale
                                                .change_amount) || 0) -
                                            (parseFloat(dueStatement.sale
                                                .paid) || 0);
                                        invoiceNumber = dueStatement.sale
                                            .invoice_number ??
                                            'N/A';
                                        totalAmount = dueStatement.sale
                                            .change_amount ?? '';
                                        paidAmount = dueStatement.sale.paid ??
                                            '';
                                        saleId = dueStatement.sale.id ?? '';
                                    } else if (dueStatement.service_sale) {
                                        totalDue = (parseFloat(dueStatement
                                            .service_sale
                                            .due))
                                        invoiceNumber = dueStatement
                                            .service_sale
                                            .invoice_number ?? 'N/A';
                                        totalAmount = dueStatement.service_sale
                                            .grand_total ?? '';
                                        paidAmount = dueStatement.service_sale
                                            .paid ?? '';
                                        serviceSaledId = dueStatement
                                            .service_sale.id ?? '';
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
                    $('#Select_balance').html('Selected Due Amount: <span style="color: green;">' +
                        totalDueSum +
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

                        if (serviceSaleId && !selectedServiceSaleIds.includes(
                                serviceSaleId)) {
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
                                    showError('.payment_balance2', res.error
                                        .payment_balance);
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

            //////////Store ////////////////

            /////////////////Single Link payment End///////////////////
        })
    </script>
@endsection
