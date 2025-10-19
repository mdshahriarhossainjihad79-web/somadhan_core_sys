@extends('master')
@section('title')
    | {{ $data->name }}
@endsection
@section('admin')
    <nav class="page-breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Dashboard</a></li>
            <li class="breadcrumb-item active" aria-current="page">
                @if ($data->party_type === 'customer')
                    Customer
                @elseif($data->party_type === 'supplier')
                    Supplier
                @else
                    Party
                @endif Profile
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
                                @if ($link_invoice_payment == 1)
                                    <button type="button"
                                        class="btn btn-outline-primary btn-icon-text float-left add_money_modal"
                                        id="payment-btn" data-bs-toggle="modal" data-bs-target="#linkDuePayment">
                                        <i class="btn-icon-prepend" data-feather="credit-card"></i>
                                        link Due Payment
                                    </button>
                                @endif
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
                                            </tr>
                                            <tr>
                                                <td>Opening Receivable </td>
                                                <td>{{ $data->opening_receivable ?? '' }}</td>
                                                <td>Opening Payable</td>
                                                <td>{{ $data->opening_payable ?? '' }}</td>
                                                <td>Total Receivable</td>
                                                <td>{{ $data->total_receivable ?? '' }}</td>
                                                <td>Total Payable</td>
                                                <td>{{ $data->total_payable ?? '' }}</td>
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

                            <div class="col-md-12">
                                @if ($data->party_type !== 'both')
                                    <div class="table-responsive">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th class="id">Invoice</th>
                                                    <th>Particulars</th>
                                                    <th>Debit</th>
                                                    <th>Credit</th>
                                                    {{-- <th>Balance</th> --}}
                                                    <th>Status</th>
                                                    <th class="id">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @if ($transactions->count() > 0)
                                                    @php
                                                        $totalDebit = 0;
                                                        $totalCredit = 0;
                                                        $totalBalance = 0;
                                                    @endphp

                                                    @foreach ($transactions as $transaction)
                                                        <tr>
                                                            <td>{{ \Carbon\Carbon::parse($transaction->date)->format('F j, Y') ?? '' }}
                                                            </td>
                                                            <td class="id">
                                                                @php
                                                                    $particularData = $transaction->particularData();
                                                                @endphp
                                                                @if ($particularData)
                                                                    @if ($data->party_type === 'customer' || $data->party_type === 'both')
                                                                        @if ($particularData->invoice_number)
                                                                            <a
                                                                                href="{{ route('sale.invoice', $particularData->id) }}">
                                                                                #{{ $particularData->invoice_number ?? 0 }}
                                                                            </a>
                                                                        @else
                                                                            <a
                                                                                href="{{ route('return.products.invoice', $particularData->id) }}">
                                                                                #{{ $particularData->return_invoice_number ?? 0 }}
                                                                            </a>
                                                                        @endif
                                                                    @else
                                                                        <a
                                                                            href="{{ route('purchase.invoice', $particularData->id) }}">
                                                                            #{{ $particularData->invoice ?? 0 }}
                                                                        </a>
                                                                    @endif
                                                                @else
                                                                    <a
                                                                        href="{{ route('transaction.invoice.receipt', $transaction->id) }}">
                                                                        #{{ rand(000000, 999999) }}
                                                                    </a>
                                                                @endif
                                                            </td>
                                                            <td>
                                                                @if ($transaction->particulars == 'Return')
                                                                        Return
                                                                @elseif (strpos($transaction->particulars, 'serviceSale#') !== false)
                                                                    Service Sale
                                                                @elseif (strpos($transaction->particulars, 'Sale#') !== false)
                                                                    Sale
                                                                @elseif ($transaction->particulars == 'SaleDue')
                                                                    Cash Deposit
                                                                @elseif (strpos($transaction->particulars, 'Purchase#') !== false)
                                                                    Purchase
                                                                @elseif ($transaction->particulars == 'PurchaseDue')
                                                                    Due Payment
                                                                @else
                                                                    {{ $transaction->particulars ?? '' }}
                                                                @endif
                                                            </td>
                                                            <td>
                                                                {{ number_format($transaction->debit, 2) ?? 0 }}
                                                            </td>
                                                            <td>
                                                                {{ number_format($transaction->credit, 2) ?? 0 }}
                                                            </td>
                                                            {{-- <td>
                                                                {{ number_format($transaction->balance, 2) ?? 0 }}
                                                            </td> --}}

                                                            @php
                                                                $totalBalance += $transaction->balance ?? 0;
                                                                $totalDebit += $transaction->debit ?? 0;
                                                                $totalCredit += $transaction->credit ?? 0;
                                                                // $totalDue = $totalBalance + $data->opening_payable;
                                                            @endphp

                                                            @if ($particularData)
                                                                @if ($data->party_type === 'customer' || $data->party_type === 'both')
                                                                    @if ($particularData->invoice_number)
                                                                        <td>
                                                                            @if ($particularData->status === 'paid')
                                                                                <span class="badge bg-success">Paid</span>
                                                                            @elseif ($particularData->status === 'unpaid')
                                                                                <span class="badge bg-danger">Unpaid</span>
                                                                            @elseif ($particularData->status === 'partial')
                                                                                <span
                                                                                    class="badge bg-warning text-dark">Partial</span>
                                                                            @else
                                                                                <span
                                                                                    class="badge bg-secondary">{{ $particularData->status }}</span>
                                                                            @endif
                                                                        </td>
                                                                        <td class="id">
                                                                            <a href="#"
                                                                                class="btn-sm btn-outline-primary float-end print"
                                                                                data-id="{{ $particularData->id }}"
                                                                                type="sale">
                                                                                <i data-feather="printer"
                                                                                    class="me-2 icon-md"></i>
                                                                            </a>

                                                                            <a href="{{ route('sale.edit', $particularData->id) }}"
                                                                                class= " btn btn-sm btn-outline-primary float-center"
                                                                                data-id="{{ $particularData->id }}"
                                                                                type="sale">
                                                                                Edit
                                                                            </a>
                                                                        </td>
                                                                    @else
                                                                        <td class="id">
                                                                            <a href="#"
                                                                                class="btn-sm btn-outline-primary float-end print"
                                                                                data-id="{{ $particularData->id }}"
                                                                                type="return">
                                                                                <i data-feather="printer"
                                                                                    class="me-2 icon-md"></i>
                                                                            </a>
                                                                        </td>
                                                                    @endif
                                                                @else
                                                                    <td>
                                                                        @if ($particularData->payment_status === 'paid')
                                                                            <span class="badge bg-success">Paid</span>
                                                                        @elseif ($particularData->payment_status === 'unpaid')
                                                                            <span class="badge bg-danger">Unpaid</span>
                                                                        @elseif ($particularData->payment_status === 'partial')
                                                                            <span
                                                                                class="badge bg-warning text-dark">Partial</span>
                                                                        @else
                                                                            <span
                                                                                class="badge bg-secondary">{{ $particularData->payment_status }}</span>
                                                                        @endif

                                                                    </td>
                                                                    <td class="id">
                                                                        <a href="#"
                                                                            class="btn-sm btn-outline-primary float-end print"
                                                                            data-id="{{ $particularData->id }}"
                                                                            type="purchase">
                                                                            <i data-feather="printer"
                                                                                class="me-2 icon-md"></i>
                                                                        </a>

                                                                        <a href="{{ route('purchase.edit', $particularData->id) }}"
                                                                            class= " btn btn-sm btn-outline-primary float-center"
                                                                            data-id="{{ $particularData->id }}"
                                                                            type="sale">
                                                                            Edit
                                                                        </a>
                                                                    </td>
                                                                @endif
                                                            @else
                                                                <td>
                                                                    @if ($transaction->particulars === 'party receive')
                                                                        @if ($transaction->status == 'used')
                                                                            <span class="badge bg-primary">Used</span>
                                                                        @elseif($transaction->status == 'unused')
                                                                            <span
                                                                                class="badge bg-danger text-dark">Unused</span>
                                                                        @else
                                                                            <span
                                                                                class="badge bg-info text-dark">N/A</span>
                                                                        @endif
                                                                    @elseif($transaction->particulars === 'party pay')
                                                                        <span class="badge bg-info text-dark">N/A</span>
                                                                    @endif
                                                                </td>

                                                                <td class="id">
                                                                    <a href="#"
                                                                        class="btn-sm btn-outline-primary float-end print"
                                                                        data-id="{{ $transaction->id }}"
                                                                        type="transaction">
                                                                        <i data-feather="printer"
                                                                            class="me-2 icon-md"></i>
                                                                    </a>
                                                                    @if ($transaction->particulars === 'party receive' && $transaction->status != 'used')
                                                                        <button type="button"
                                                                            class="btn btn-outline-primary btn-icon-text float-left add_single_money_modal"
                                                                            id="single-payment-btn"
                                                                            data-customer-id="{{ $transaction->customer_id }}"
                                                                            data-transacton-id="{{ $transaction->id }}"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#linkSingleDuePayment">
                                                                            <i class="btn-icon-prepend"
                                                                                data-feather="credit-card"></i>
                                                                            link Payment
                                                                        </button>
                                                                    @elseif($transaction->particulars === 'party receive' && $transaction->status == 'used')
                                                                        <a
                                                                            class= " btn btn-sm btn-outline-success float-center">
                                                                            Used
                                                                        </a>
                                                                    @endif
                                                                </td>
                                                            @endif
                                                        </tr>
                                                    @endforeach
                                                    <tr>
                                                        <td class="id"></td>
                                                        <td></td>
                                                        <td>Total</td>
                                                        <td> {{ number_format($totalDebit, 2) }}</td>
                                                        <td> {{ number_format($totalCredit, 2) }}</td>
                                                        {{-- <td>
                                                            {{ number_format($totalBalance, 2) }}
                                                        </td> --}}
                                                    </tr>
                                                @else
                                                    <tr>
                                                        <td colspan="7" class="text-center">No Data Found</td>
                                                    </tr>
                                                @endif


                                            </tbody>

                                        </table>
                                    </div>
                                @else
                                    @php
                                        $saleTransactions = $transactions->filter(function ($transaction) {
                                            return !is_null($transaction->customer_id);
                                        });
                                        $purchaseTransactions = $transactions->filter(function ($transaction) {
                                            return !is_null($transaction->supplier_id);
                                        });
                                    @endphp
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h5 class="text-center my-2">Sale Invoice</h5>
                                            @if ($saleTransactions->count() > 0)
                                                <div class="table-responsive">
                                                    <table class="table">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th class="id">Invoice</th>
                                                                <th>Particulars</th>
                                                                <th>Debit</th>
                                                                <th>Credit</th>
                                                                {{-- <th>Balance</th> --}}
                                                                <th class="id">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            @if ($saleTransactions->count() > 0)
                                                                @php
                                                                    $totalDebit = 0;
                                                                    $totalCredit = 0;
                                                                    $totalBalance = 0;
                                                                @endphp
                                                                @foreach ($saleTransactions as $transaction)
                                                                    <tr>
                                                                        <td>{{ \Carbon\Carbon::parse($transaction->date)->format('F j, Y') ?? '' }}
                                                                        </td>
                                                                        <td class="id">
                                                                            @php
                                                                                $particularData = $transaction->particularData();
                                                                            @endphp
                                                                            @if ($particularData)
                                                                                @if ($particularData->invoice_number)
                                                                                    <a
                                                                                        href="{{ route('sale.invoice', $particularData->id) }}">
                                                                                        #{{ $particularData->invoice_number ?? 0 }}
                                                                                    </a>
                                                                                @else
                                                                                    <a
                                                                                        href="{{ route('return.products.invoice', $particularData->id) }}">
                                                                                        #{{ $particularData->return_invoice_number ?? 0 }}
                                                                                    </a>
                                                                                @endif
                                                                            @else
                                                                                <a
                                                                                    href="{{ route('transaction.invoice.receipt', $transaction->id) }}">
                                                                                    #{{ rand(000000, 999999) }}
                                                                                </a>
                                                                            @endif
                                                                        </td>
                                                                        <td>
                                                                            @if ($transaction->particulars == 'Return')
                                                                                 Return
                                                                            @elseif (strpos($transaction->particulars, 'serviceSale#') !== false)
                                                                                Service Sale
                                                                            @elseif (strpos($transaction->particulars, 'Sale#') !== false)
                                                                                Sale
                                                                            @elseif ($transaction->particulars == 'SaleDue')
                                                                                Cash Deposit
                                                                            @else
                                                                                {{ $transaction->particulars ?? '' }}
                                                                            @endif
                                                                        </td>
                                                                        <td>
                                                                            {{ number_format($transaction->debit, 2) ?? 0 }}
                                                                        </td>
                                                                        <td>
                                                                            {{ number_format($transaction->credit, 2) ?? 0 }}
                                                                        </td>
                                                                        {{-- <td>
                                                                            {{ number_format($transaction->balance, 2) ?? 0 }}
                                                                        </td> --}}
                                                                        @php
                                                                            $totalBalance += $transaction->balance ?? 0;
                                                                            $totalDebit += $transaction->debit ?? 0;
                                                                            $totalCredit += $transaction->credit ?? 0;
                                                                            // $totalDue = $totalBalance + $data->opening_payable;
                                                                        @endphp
                                                                        <td class="id">
                                                                            @if ($particularData)
                                                                                @if ($particularData->invoice_number)
                                                                                    <a href="#"
                                                                                        class="btn-sm btn-outline-primary float-end print"
                                                                                        data-id="{{ $particularData->id }}"
                                                                                        type="sale">
                                                                                        <i data-feather="printer"
                                                                                            class="me-2 icon-md"></i>
                                                                                    </a>
                                                                                @else
                                                                                    <a href="#"
                                                                                        class="btn-sm btn-outline-primary float-end print"
                                                                                        data-id="{{ $particularData->id }}"
                                                                                        type="return">
                                                                                        <i data-feather="printer"
                                                                                            class="me-2 icon-md"></i>
                                                                                    </a>
                                                                                @endif
                                                                            @else
                                                                                <a href="#"
                                                                                    class="btn-sm btn-outline-primary float-end print"
                                                                                    data-id="{{ $transaction->id }}"
                                                                                    type="transaction">
                                                                                    <i data-feather="printer"
                                                                                        class="me-2 icon-md"></i>
                                                                                </a>
                                                                            @endif
                                                                        </td>
                                                                    </tr>
                                                                @endforeach
                                                                <tr>
                                                                    <td class="id"></td>
                                                                    <td></td>
                                                                    <td>Total</td>
                                                                    <td> {{ number_format($totalDebit, 2) }}</td>

                                                                    <td> {{ number_format($totalCredit, 2) }}</td>
                                                                    {{-- <td>
                                                                        {{ number_format($totalBalance, 2) }}
                                                                    </td> --}}

                                                                </tr>
                                                            @else
                                                                <tr>
                                                                    <td colspan="7" class="text-center">No Data Found
                                                                    </td>
                                                                </tr>
                                                            @endif
                                                        </tbody>
                                                    </table>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="col-md-6">
                                            <h5 class="text-center my-2">Purchase Invoice</h5>
                                            @if ($purchaseTransactions->count() > 0)
                                                <div class="table-responsive">
                                                    <table class="table">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th class="id">Invoice</th>
                                                                <th>Particulars</th>
                                                                <th>Debit</th>
                                                                <th>Credit</th>
                                                                <th>Balance</th>
                                                                <th class="id">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            @if ($purchaseTransactions->count() > 0)
                                                                @php
                                                                    $totalDebit = 0;
                                                                    $totalCredit = 0;
                                                                    $totalBalance = 0;
                                                                @endphp

                                                                @foreach ($purchaseTransactions as $transaction)
                                                                    <tr>
                                                                        <td>{{ \Carbon\Carbon::parse($transaction->date)->format('F j, Y') ?? '' }}
                                                                        </td>
                                                                        <td class="id">
                                                                            @php
                                                                                $particularData = $transaction->particularData();
                                                                            @endphp
                                                                            @if ($particularData)
                                                                                <a
                                                                                    href="{{ route('purchase.invoice', $particularData->id) }}">
                                                                                    #{{ $particularData->invoice ?? 0 }}
                                                                                </a>
                                                                            @else
                                                                                <a
                                                                                    href="{{ route('transaction.invoice.receipt', $transaction->id) }}">
                                                                                    #{{ rand(000000, 999999) }}
                                                                                </a>
                                                                            @endif
                                                                        </td>
                                                                        <td>
                                                                            @if (strpos($transaction->particulars, 'Purchase#') !== false)
                                                                                Purchase
                                                                            @elseif ($transaction->particulars == 'PurchaseDue')
                                                                                Due Payment
                                                                            @else
                                                                                {{ $transaction->particulars ?? '' }}
                                                                            @endif
                                                                        </td>
                                                                        <td>
                                                                            {{ number_format($transaction->debit, 2) ?? 0 }}
                                                                        </td>
                                                                        <td>
                                                                            {{ number_format($transaction->credit, 2) ?? 0 }}
                                                                        </td>
                                                                        <td>
                                                                            {{ number_format($transaction->balance, 2) ?? 0 }}
                                                                        </td>
                                                                        @php
                                                                            $totalBalance += $transaction->balance ?? 0;
                                                                            $totalDebi += $transaction->debit ?? 0;
                                                                            $totalCredit += $transaction->credit ?? 0;
                                                                        @endphp
                                                                        <td class="id">
                                                                            @if ($particularData)
                                                                                <a href="#"
                                                                                    class="btn-sm btn-outline-primary float-end print"
                                                                                    data-id="{{ $particularData->id }}"
                                                                                    type="purchase">
                                                                                    <i data-feather="printer"
                                                                                        class="me-2 icon-md"></i>
                                                                                </a>
                                                                            @else
                                                                                <a href="#"
                                                                                    class="btn-sm btn-outline-primary float-end print"
                                                                                    data-id="{{ $transaction->id }}"
                                                                                    type="transaction">
                                                                                    <i data-feather="printer"
                                                                                        class="me-2 icon-md"></i>
                                                                                </a>
                                                                            @endif
                                                                        </td>
                                                                    </tr>
                                                                @endforeach
                                                                <tr>
                                                                    <td class="id"></td>
                                                                    <td></td>
                                                                    <td>Total</td>
                                                                    <td> {{ number_format($totalDebit, 2) }}</td>

                                                                    <td> {{ number_format($totalCredit, 2) }}</td>
                                                                    <td>
                                                                        {{ number_format($totalBalance, 2) }}
                                                                    </td>

                                                                </tr>
                                                            @else
                                                                <tr>
                                                                    <td colspan="7" class="text-center">No Data Found
                                                                    </td>
                                                                </tr>
                                                            @endif
                                                        </tbody>
                                                    </table>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Via Sale Payment Start -->
    <div class="modal fade" id="viaSalePaymentModal" tabindex="-1" aria-labelledby="exampleModalScrollableTitle"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalScrollableTitle">Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
                </div>
                <div class="modal-body">
                    <form id="signupForm" class="paymentForm row">
                        <div class="mb-3 col-md-12">
                            <label for="name" class="form-label">Payment Date<span
                                    class="text-danger">*</span></label>
                            <div class="input-group flatpickr" id="flatpickr-date">
                                <input type="text" class="form-control from-date flatpickr-input payment_date"
                                    placeholder="Payment Date" data-input="" readonly="readonly" name="payment_date">
                                <span class="input-group-text input-group-addon" data-toggle=""><svg
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2">
                                        </rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg></span>
                            </div>
                        </div>
                        <div class="mb-3 col-md-6">
                            <label for="name" class="form-label">Transaction Account<span
                                    class="text-danger">*</span></label>
                            @php
                                $payments = App\Models\Bank::all();
                            @endphp
                            <select class="form-select transaction_account" data-width="100%" name="transaction_account"
                                onclick="errorRemove(this);" onblur="errorRemove(this);">
                                @if ($payments->count() > 0)
                                    @foreach ($payments as $payment)
                                        <option value="{{ $payment->id }}">{{ $payment->name }}</option>
                                    @endforeach
                                @else
                                    <option selected disabled>Please Add Payment</option>
                                @endif
                            </select>
                            <span class="text-danger transaction_account_error"></span>
                        </div>
                        <div class="mb-3 col-md-6">
                            <label for="name" class="form-label">Amount<span class="text-danger">*</span></label>
                            <input id="defaultconfig" class="form-control amount" maxlength="39" name="amount"
                                type="number" onkeyup="errorRemove(this);" onblur="errorRemove(this);">
                            <span class="text-danger amount_error"></span>
                        </div>
                        <div class="mb-3 col-md-12">
                            <label for="name" class="form-label">Note</label>
                            <textarea name="note" class="form-control note" id="" placeholder="Enter Note (Optional)"
                                rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary via_sale_save_payment">Payment</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Via Sale Payment End --->
    <iframe id="printFrame" src="" width="0" height="0"></iframe>
    <!-- Modal add Payment -->
    <div class="modal fade" id="duePayment" tabindex="-1" aria-labelledby="exampleModalScrollableTitle"
        aria-hidden="true">
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
    </div>
    <!--Link Payment Multiple  Modal add Payment End -->
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
                        <input type="hidden" name="customer_id" value="">
                        <input type="hidden" name="transaction_id" value="">
                        <input type="hidden" name="unused_amount" id="unused_amount" class="form-control">
                        <div class="mb-3 col-md-12">
                            <p class="" id="unused_balance2"></p>
                        </div>
                        <div class="mb-3 col-md-12">
                            <p class="" id="Select_balance2"></p>
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
                    <a type="button" class="btn btn-primary" id="add_single_link_payment">Payment</a>
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
            a,
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
            $(document).on('click', '.via_sale_add_payment', function(e) {
                e.preventDefault();
                let id = $(this).attr('data-id');
                // alert(id);
                var currentDate = new Date().toISOString().split('T')[0];
                $('.payment_date').val(currentDate);
                $('.via_sale_save_payment').val(id);
                $.ajax({
                    url: '/via-sale/get/' + id,
                    method: "GET",
                    success: function(res) {
                        console.log(res);
                        if (res.status == 200) {
                            console.log(res);
                            $('.amount').val(res.data.due);
                        }
                    }
                })
            });

            // save payment
            $(document).on('click', '.via_sale_save_payment', function(e) {
                e.preventDefault();
                let id = $(this).val();
                // alert(id);
                let formData = new FormData($('.paymentForm')[0]);
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });
                $.ajax({
                    url: `/via-sale/payment/${id}`,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(res) {
                        if (res.status == 200) {
                            $('#paymentModal').modal('hide');
                            $('.paymentForm')[0].reset();
                            toastr.success(res.message);
                            window.location.reload();
                        } else if (res.status == 400) {
                            $('#paymentModal').modal('hide');
                            toastr.warning(res.message);
                        } else {
                            if (res.error.paid) {
                                showError('.amount', res.error.paid);
                            }
                            if (res.error.amount) {
                                showError('.amount', res.error.amount);
                            }
                            if (res.error.payment_method) {
                                showError('.transaction_account', res.error.payment_method);
                            }
                        }
                    }
                });
            })
            //Link Invoice Payment Multiple Start//

            const customerId = {{ json_encode($data->id) }};
            $.ajax({
                url: `/get-due-invoice2/${customerId}`,
                type: 'GET',
                success: function(response) {
                    console.log(response.transactionsUnused)
                    // console.log('due',response.serviceSaleTransaction); //
                    let tableBody = $('#DueinkInvoiceTable tbody');
                    tableBody.empty();
                    if (response.serviceSaleTransaction) {
                        response.serviceSaleTransaction.forEach(function(serviceSale) {

                            const row = `
                        <tr>
                          <td>
                  <input type="checkbox" class="row-checkbox"
                   Service_id="${serviceSale.id ?? ''}"
                   data-due="${serviceSale.due}">
                    </td>
                    <td>${serviceSale.date ?? ''}</td>
                    <td>${'Service Sale'}</td>
                    <td>${serviceSale?.invoice_number ?? 'N/A'}</td>
                    <td>${serviceSale?.grand_total ?? ""}</td>
                    <td>${serviceSale?.paid??""}</td>
                    <td>${serviceSale?.due ?? ""}</td>
                        </tr>
                    `;
                            tableBody.append(row);
                        })

                        $('.row-checkbox').on('change', function() {
                            updateTotalDue2();
                            // dueShow2()
                        });

                    }
                    ///Unused Payment Start
                    let tableBody2 = $('#unpaidStatusTable tbody');
                    tableBody2.empty();
                    if (response.transactionsUnused) {
                        response.transactionsUnused.forEach(function(unusePayment) {

                            const row = `
                        <tr>
                          <td>
                  <input type="checkbox" class="row-checkbox-unused"
                   unused_id="${unusePayment.id ?? ''}"
                   data-due="${unusePayment.debit}">
                    </td>
                    <td>${unusePayment.date ?? ''}</td>
                    <td>${unusePayment.payment_type ?? ''}</td>
                    <td>${unusePayment?.debit ?? 'N/A'}</td>
                    <td>${unusePayment?.status ?? ""}</td>

                        </tr>
                    `;
                            tableBody2.append(row);
                        })

                        $('.row-checkbox-unused').on('change', function() {
                            unusedTotalAmount();
                            // dueShow2()
                        });

                    }
                    ///Unused Payment End
                    if (response.data) {
                        // Clear any existing rows //
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
                                    updateTotalDue2();
                                    // dueShow2()
                                });
                            }

                        });

                    } else {
                        // alert('No transactions found.');
                    }
                },
                error: function() {
                    alert('Failed to fetch transactions.');
                }
            });

            // Handle "Select All" checkbox
            $('#selectAll').on('click', function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox').prop('checked', isChecked);
                updateTotalDue2();
                // dueShow2()
            });
            $('#selectAll2').on('click', function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox-unused').prop('checked', isChecked);
                unusedTotalAmount();
                // dueShow2()
            });

            function updateTotalDue2() {
                let totalDueSum = 0;
                $('.row-checkbox:checked').each(function() {
                    const dueAmount = parseFloat($(this).data('due')) || 0;
                    totalDueSum += dueAmount;
                });
                // $('#payment_balance').val(totalDueSum);
                $('#Select_balance').html('Selected Due Amount: <span style="color: green;">' + totalDueSum +
                    ' ৳</span>');

                return totalDueSum;
            }

            function unusedTotalAmount() {
                let totalUnusedSum = 0;
                $('.row-checkbox-unused:checked').each(function() {
                    const totalAmount = parseFloat($(this).data('due'));
                    totalUnusedSum += totalAmount;
                });
                $('#unused_balance').html('Selected Unused Amount: <span style="color: green;">' + totalUnusedSum +
                    ' ৳</span>');
                $('.payment_balance2').val(totalUnusedSum);

                return totalUnusedSum;
            }
            /////////////////Link Due Payment ////////////////

            const addlLnk_payment = document.getElementById('add_link_payment');
            addlLnk_payment.addEventListener('click', function(e) {
                e.preventDefault();
                let formData = new FormData($('.addLinkPaymentForm')[0]);
                const paymentAmount = parseFloat(formData.get('payment_balance')) || 0;
                // console.log(paymentAmount)
                const selectedUnusedIds = [];
                const selectedSaleIds = [];
                const selectedServiceSaleIds = [];
                const selectedTransactionIds = [];
                const totalDue = updateTotalDue2();
                if (paymentAmount > totalDue) {
                    toastr.error(
                        `Payment amount (${paymentAmount}) cannot exceed total Selected due (${totalDue.toFixed(2)})`
                    );
                    return;
                }

                $('.row-checkbox:checked').each(function() {
                    const saleId = $(this).attr('sale_id');
                    const serviceSaleId = $(this).attr('Service_id');
                    const transactionId = $(this).attr('transaction_id');

                    // Only add to the array if the saleId or transactionId is not null
                    if (saleId && !selectedSaleIds.includes(saleId)) {
                        selectedSaleIds.push(saleId);
                    }
                    if (serviceSaleId && !selectedServiceSaleIds.includes(serviceSaleId)) {
                        selectedServiceSaleIds.push(serviceSaleId);
                    }
                    if (transactionId && !selectedTransactionIds.includes(transactionId)) {
                        selectedTransactionIds.push(transactionId);
                    }
                });
                $('.row-checkbox-unused:checked').each(function() {
                    const unusedTransaction = $(this).attr('unused_id');
                    if (unusedTransaction && !selectedUnusedIds.includes(unusedTransaction)) {
                        selectedUnusedIds.push(unusedTransaction);
                    }
                });
                formData.append('sale_ids', JSON.stringify(selectedSaleIds));
                formData.append('transaction_ids', JSON.stringify(selectedTransactionIds));
                formData.append('Service_ids', JSON.stringify(selectedServiceSaleIds));
                formData.append('unused_ids', JSON.stringify(selectedUnusedIds));
                // CSRF Token setup
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });

                // AJAX request
                $.ajax({
                    url: '/link/due/invoice/payment/transaction',
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
            //Link Invoice Payment Multiple End//
            /////////////////Single Link payment Start///////////////////
            $('.add_single_money_modal').on('click', function() {
                // alert('ok')
                updateTotalDue()

                const customerId = $(this).data('customer-id'); //

                const transactionId = $(this).data('transacton-id'); //
                //   console.log('transactionId-d',transactionId);
                const $form = $('#addLinkPaymentForm2');

                $form.find('input[name="customer_id"]').val(customerId);
                $form.find('input[name="transaction_id"]').val(transactionId || '');
                const $modal = $('#linkSingleDuePayment');
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

                        let tableBody = $('#DueSinglelinkInvoiceTable tbody');
                        tableBody.empty();

                        ///Unused Payment Start
                        $('#unused_balance2').text(
                            response.transctionUnsedAmount ?
                            `Unused Amount: ${response.transctionUnsedAmount}` :
                            'Unused Amount: 0.00'
                        );
                        const unusedAmount = response.transctionUnsedAmount ?
                            parseFloat(response.transctionUnsedAmount) :
                            '0.00';
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
                                    <input type="checkbox" class="row-checkbox-single"
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
                                tableBody.append(
                                openingDueRow); // টেবিলের উপরে সারি যোগ করুন //
                            }

                            response.data.forEach(function(transaction) {

                                if (transaction.particulars === 'OpeningDue') {
                                    return; //
                                }
                                if (transaction.sale.status === 'paid') {
                                    return; //
                                }

                                const totalDue = transaction.sale ? transaction.sale
                                    .change_amount -
                                    transaction.sale.paid : 0;

                                // Only add rows with positive total due
                                // const conditionDue = transaction.sale.due;

                                if (totalDue > 0) {
                                    const row = `
                            <tr>
                            <td>
                    <input type="checkbox" class="row-checkbox-single"
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
                                    $('.row-checkbox-single').on('change', function() {
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
            $('#selectAllSingle').on('click', function() {
                const isChecked = $(this).prop('checked');
                $('.row-checkbox-single').prop('checked', isChecked);
                updateTotalDue();

            });

            function updateTotalDue() {
                let totalDueSum = 0;
                $('.row-checkbox-single:checked').each(function() {
                    const dueAmount = parseFloat($(this).data('due')) || 0;
                    totalDueSum += dueAmount;
                });
                // $('#payment_balance').val(totalDueSum);
                $('#Select_balance2').html('Selected Due Amount: <span style="color: green;">' + totalDueSum +
                    ' ৳</span>');

                return totalDueSum;
            }
            //////////Store ////////////////
            const addSinglelLnk_payment = document.getElementById('add_single_link_payment');
            addSinglelLnk_payment.addEventListener('click', function(e) {
                // console.log('Working on payment')
                e.preventDefault();

                let formData = new FormData($('.addLinkPaymentForm2')[0]);
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
                $('.row-checkbox-single:checked').each(function() {
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
                            $('#linkSingleDuePayment').modal('hide');
                            // Reset the form
                            $('.addLinkPaymentForm2')[0].reset();
                            toastr.success(res.message);
                            window.location.reload();
                        } else if (res.status == 400) {
                            showError('.account', res.message);
                        } else {


                        }
                    },
                    error: function(err) {
                        toastr.error('An error occurred, Empty Feild Required.');
                    }
                });
            });

            /////////////////Single Link payment End///////////////////
        })
    </script>
@endsection
