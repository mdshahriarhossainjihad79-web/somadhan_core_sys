<div class="row">
    <div class="col-md-12 ">
        <div id="" class="table-responsive">
            <table id="example" class="table w-100">
                <thead>
                    <tr>
                        <th>SN</th>
                        <th>Transaction ID</th>
                        <th>Date/Time</th>
                        <th>Created By</th>
                        <th>Payment Type</th>
                        <th>INV No.</th>
                        <th>Purpose</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Status</th>
                        {{-- <th class="action-edit">Action</th> --}}
                    </tr>
                </thead>
                <tbody class="showData">
                    @if ($accountTransaction->count() > 0)
                        @foreach ($accountTransaction as $key => $acountData)
                            <tr>
                                <td>{{ $key + 1 }}</td>
                                <td>
                                    @if ($acountData->purpose == 'sale')
                                        <a href="{{ route('sale.edit', $acountData->reference_id) }}">
                                            {{ $acountData->transaction_id }}
                                        </a>
                                    @elseif ($acountData->purpose == 'purchase')
                                        <a href="{{ route('purchase.edit', $acountData->reference_id) }}">
                                            {{ $acountData->transaction_id }}
                                        </a>
                                    @elseif (in_array($acountData->purpose, [
                                            'from_bank_transfer',
                                            'to_bank_transfer',
                                            'to_bank_transfer_update',
                                            'from_bank_transfer_update',
                                        ]))
                                        <a href="#" class=" bank_to_bank_edit"
                                            data-id="{{ $acountData->reference_id }}" data-bs-toggle="modal"
                                            data-bs-target="#edit">
                                            {{ $acountData->transaction_id }}
                                        </a>
                                     @elseif(
                                            $acountData->purpose == 'party_receive'
                                            && $acountData->partystatement
                                            && $acountData->partystatement->status == 'unused'
                                        )
                                        <a href="#" class="party_receive_pay_edit"
                                            data-transaction-id="{{ $acountData->id }}"
                                            data-bs-toggle="modal" data-bs-target="#party_receive_pay_edit">
                                            {{ $acountData->transaction_id }}
                                        </a>
                                    @else
                                      {{ $acountData->transaction_id }}
                                    @endif

                                </td>
                                <td>{{ $acountData->created_at->timezone('Asia/Dhaka')->format('d-m-Y h:i a') }}</td>
                                <td>{{ $acountData['user']['name'] ?? '' }}</td>
                                <td>{{ $acountData['bank']['name'] ?? '' }}</td>
                                @if (in_array($acountData->purpose, [
                                        'from_bank_transfer',
                                        'to_bank_transfer',
                                        'to_bank_transfer_update',
                                        'from_bank_transfer_update',
                                    ]))
                                    <td>{{ $acountData->bankToBankTransfer->invoice ?? 'N/A' }}</td>
                                @elseif($acountData->purpose === 'sale')
                                    <td>{{ $acountData->sale->invoice_number ?? 'N/A' }}</td>
                                @elseif($acountData->purpose === 'purchase' || $acountData->purpose === 'Purchase Edit')
                                    <td>{{ $acountData->purchase->invoice ?? 'N/A' }}</td>
                                @else
                                    <td>N/A</td>
                                @endif
                                {{-- <td>@if ($acountData->purpose == 'receive'){{'Deposit'}}@else{{'Withdrawal'}}@endif</td> --}}
                                <td> {{ ucwords(str_replace('_', ' ', $acountData->purpose ?? '')) }}</td>
                                <td>{{ $acountData->debit ?? '0' }} TK</td>
                                <td>{{ $acountData->credit ?? '0' }}TK</td>

                                <td>

                                    @if (in_array($acountData->purpose, ['sale', 'purchase', 'party_receive']))
                                        @if ($acountData->purpose === 'sale' && isset($acountData->sale))
                                            @switch($acountData->sale->status)
                                                @case('paid')
                                                    <span class="badge bg-success">Paid</span>
                                                @break

                                                @case('unpaid')
                                                    <span class="badge bg-danger">Unpaid</span>
                                                @break

                                                @case('partial')
                                                    <span class="badge bg-warning text-dark">Partial</span>
                                                @break

                                                @default
                                                    <span
                                                        class="badge bg-secondary">{{ $acountData->sale->status ?? 'N/A' }}</span>
                                            @endswitch
                                        @elseif ($acountData->purpose === 'purchase' && isset($acountData->purchase))
                                            @switch($acountData->purchase->payment_status)
                                                @case('paid')
                                                    <span class="badge bg-success">Paid</span>
                                                @break

                                                @case('unpaid')
                                                    <span class="badge bg-danger">Unpaid</span>
                                                @break

                                                @case('partial')
                                                    <span class="badge bg-warning text-dark">Partial</span>
                                                @break

                                                @default
                                                    <span
                                                        class="badge bg-secondary">{{ $acountData->purchase->payment_status ?? 'N/A' }}</span>
                                            @endswitch
                                        @elseif ($acountData->purpose === 'party_receive' && isset($acountData->partystatement))
                                            @switch($acountData->partystatement->status)
                                                @case('used')
                                                    <span class="badge bg-success">Used</span>
                                                @break

                                                @case('unused')
                                                    <span class="badge bg-danger">Unused</span>
                                                @break

                                                @default
                                                    <span
                                                        class="badge bg-secondary">{{ $acountData->partystatement->status ?? 'N/A' }}</span>
                                            @endswitch
                                        @else
                                            <span class="badge bg-secondary">N/A</span>
                                        @endif
                                    @else
                                        <span class="badge bg-secondary">N/A</span>
                                    @endif

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
{{-- //Edit Modal // --}}
@php
    $banks = App\Models\Bank::all();

@endphp
<!-- Modal  Bank To Bank Edit-->
<div class="modal fade" id="edit" tabindex="-1" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalScrollableTitle">Edit Bank To Bank</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="btn-close"></button>
            </div>
            <div class="modal-body">
                <form id="signupForm" class="bankToBankFormEdit row">
                    <div class="mb-3 col-md-6">
                        <label for="name" class="form-label">From <span class="text-danger">*</span></label>
                        <select name="from" class="form-control from_edit" id=""
                            onchange="errorRemove(this);" onblur="errorRemove(this);">
                            <option value="" selected disabled>Select Bank From </option>
                            @foreach ($banks as $bank)
                                <option value="{{ $bank->id }}">{{ $bank->name }}</option>
                            @endforeach

                        </select>
                        <span class="text-danger from_edit_error"></span>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="name" class="form-label">To <span class="text-danger">*</span> </label>
                        <select name="to" class="form-control to_edit" id="" onchange="errorRemove(this);"
                            onblur="errorRemove(this);">
                            <option value="" selected disabled>Select Bank To </option>
                            @foreach ($banks as $bank)
                                <option value="{{ $bank->id }}">{{ $bank->name }}</option>
                            @endforeach
                        </select>
                        <span class="text-danger to_edit_error"></span>
                    </div>
                    <div class="mb-3 col-md-6">
                        <label for="name" class="form-label">Amount <span class="text-danger">*</span></label>
                        <input id="defaultconfig" class="form-control amount_edit" maxlength="39" name="amount"
                            type="number" onkeyup="errorRemove(this);" onblur="errorRemove(this);">
                        <span class="text-danger amount_edit_error"></span>
                    </div>
                    <div class=" col-md-6 ">
                        <label class=" bg-transparent"> Transfer Date <span class="text-danger">*</span></label>
                        <input type="date" name="date"
                            class="form-control bg-transparent border-primary date_edit" onchange="errorRemove(this);"
                            onblur="errorRemove(this);">
                        <span class="text-danger date_edit_error"></span>
                    </div>
                    <div class="mb-3 col-md-12">
                        <label for="name" class="form-label">Description</label>
                        <textarea name="description" class="form-control description_edit" id="" cols="30" rows="2"></textarea>
                    </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary update_bankToBank">Update</button>
            </div>
            </form>
        </div>
    </div>
</div>
{{-- ///Party Receive Pay Edit --}}
<div class="modal fade" id="party_receive_pay_edit" tabindex="-1" aria-labelledby="exampleModalScrollableTitle"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalScrollableTitle">Edit Party Pay/Receive</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="partyReceivePpayEdit" class="partyReceivePpayEdit row"> {{-- Moved form open here for proper wrapping --}}
                <div class="modal-body">


                    <div class="mb-3 col-md-12">
                        <label for="amount_edit" class="form-label">Amount <span class="text-danger">*</span></label>
                        <input id="bank_amount_edit" class="form-control bank_amount_edit" maxlength="39"
                            name="bank_amount_edit" type="number" step="0.01" required
                            onkeyup="errorRemove(this);" onblur="errorRemove(this);">
                        <span class="text-danger bank_amount_edit_error"></span>
                    </div>
                    <div class="mb-3 col-md-12">
                        <label for="date_edit" class="form-label">Transfer Date <span
                                class="text-danger">*</span></label>
                        <input type="date" name="bank_date_edit" id="bank_date_edit"
                            class="form-control bank_date_edit" value="{{ date('Y-m-d') }}" required
                            onchange="errorRemove(this);" onblur="errorRemove(this);">
                        <span class="text-danger bank_date_edit_error"></span>
                    </div>
                    <div class="mb-3 col-md-12">
                        <label for="description_edit" class="form-label">Description</label>
                        <textarea name="description" class="form-control description_edit" id="description_edit" cols="30"
                            rows="2"></textarea>
                    </div>
                    <input class="party_statement_id" value="" type="hidden">
                    <input class="account_transaction_id" value="" type="hidden">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary  update_party_receive_pay_edit">Update</button>
                    {{-- Changed to submit for form handling --}}
                </div>
            </form> {{-- Closing form here --}}
        </div>
    </div>
</div>

<script>
    $(document).on('click', '.bank_to_bank_edit', function(e) {
        e.preventDefault();
        // alert('ok');
        let id = this.getAttribute('data-id');
        // alert(id);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            url: `/bank/to/bank/edit/${id}`,
            type: 'GET',
            success: function(data) {
                // console.log(data.bankTobank);
                // console.log(data.bankTobank.from);
                if (data.bankTobank && data.bankTobank.from) {
                    $('.from_edit').val(data.bankTobank.from);
                } else {
                    console.log('From ID not found');
                }
                if (data.bankTobank && data.bankTobank.to) {
                    $('.to_edit').val(data.bankTobank.to);
                } else {
                    console.log('To ID not found');
                }
                $('.amount_edit').val(data.bankTobank.amount);
                $('.date_edit').val(data.bankTobank.transfer_date);
                $('.date_edit').val(data.bankTobank.transfer_date);
                $('.description_edit').val(data.bankTobank.description);
                $('.update_bankToBank').val(data.bankTobank.id);
                if (data.bankTobank.image) {
                    $('.showEditImage').attr('src',
                        `${url}/uploads/bank_transfer/` + data.bankTobank
                        .image);
                } else {
                    $('.showEditImage').attr('src',
                        `${url}/dummy/image.jpg`);
                }
            }
        });
    })
    $('.update_bankToBank').click(function(e) {
        e.preventDefault();
        // alert('ok');
        const fromBank = document.querySelector('.from_edit').value;
        const toBank = document.querySelector('.to_edit').value;

        // Check if the "From" and "To" banks are the same
        if (fromBank && toBank && fromBank === toBank) {
            toastr.error('The "From" and "To" banks cannot be the same.');
            showError('.from', 'The "From" and "To" banks cannot be the same.');
            showError('.to', 'The "From" and "To" banks cannot be the same.');
            return; // Stop further execution
        }
        let id = $('.update_bankToBank').val();
        // console.log(id);
        let formData = new FormData($('.bankToBankFormEdit')[0]);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            url: `/bank/to/bank/update/${id}`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                if (res.status == 200) {
                    $('#edit').modal('hide');
                    $('.bankToBankFormEdit')[0].reset();
                    toastr.success(res.message);
                    window.location.reload();
                } else if (res.status === 405) {
                    toastr.error(res.errormessage);
                }
            },
            error: function(xhr, status, error) {
                if (xhr.status === 500) {
                    toastr.error('Server error occurred. Please contact support.');
                    console.log('Server Error:', xhr.responseText);
                } else if (xhr.status === 422) {
                    let errors = xhr.responseJSON.error;
                    if (errors.from) showError('.from_edit', errors.from[0]);
                    if (errors.to) showError('.to_edit', errors.to[0]);
                    if (errors.amount) showError('.amount_edit', errors.amount[0]);
                    if (errors.date) showError('.date_edit', errors.date[0]);
                } else {
                    toastr.error('An error occurred. Please try again.');
                }
            }
        });

    })
    ///////////////Party Pay || Receive Edit //////////
    $(document).on('click', '.party_receive_pay_edit', function(e) {
        e.preventDefault();
        // alert('ok');
        let id = this.getAttribute('data-transaction-id');
        // alert(id);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            url: `/party/pay/receive/edit/${id}`,
            type: 'GET',
            success: function(data) {

                if (data.account_transaction.purpose == "party_receive") {
                    $('.bank_amount_edit').val(data.account_transaction.credit);

                } else {
                    $('.bank_amount_edit').val(data.account_transaction.debit);
                }
                 $('.update_party_receive_pay_edit').val(data.account_transaction.id);
                 $('.account_transaction_id').val(data.account_transaction.id);
                 $('.party_statement_id').val(data.party_statements.id);

            }
        });
    })
        $('.update_party_receive_pay_edit').click(function(e) {
        e.preventDefault();
        // alert('ok');
        const bank_date_edit = document.querySelector('.bank_date_edit').value;
        const bank_amount_edit = document.querySelector('.bank_amount_edit').value;
        const account_transaction_id = document.querySelector('.account_transaction_id').value; // Adjust selector
        let account_transaction_id1 = $('.update_party_receive_pay_edit').val();
        let party_statement_id = document.querySelector('.party_statement_id').value;
        let formData = new FormData($('.partyReceivePpayEdit')[0]);

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            url: `/update/party/receive/${account_transaction_id1}`,
            processData: false,
            data: formData,
            type: 'POST',
            contentType: false,
            success: function(res) {
                if (res.status == 200) {
                    $('#party_receive_pay_edit').modal('hide');
                    $('.partyReceivePpayEdit')[0].reset();
                    toastr.success(res.message);
                    window.location.reload();
                } else if (res.status === 405) {
                    toastr.error(res.errormessage);
                }
            },
            error: function(xhr, status, error) {
                if (xhr.status === 500) {
                    toastr.error('Server error occurred. Please contact support.');
                    console.log('Server Error:', xhr.responseText);
                } else if (xhr.status === 422) {
                    let errors = xhr.responseJSON.error;
                    // if (errors.from) showError('.from_edit', errors.from[0]);
                    // if (errors.to) showError('.to_edit', errors.to[0]);
                    // if (errors.amount) showError('.amount_edit', errors.amount[0]);
                    // if (errors.date) showError('.date_edit', errors.date[0]);
                } else {
                    toastr.error('An error occurred. Please try again.');
                }
            }
        });

    })
</script>
