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
                            <th>Status</th>
                            <th class="actions">Action</th>
                        </tr>
                    </thead>
                    <tbody class="showData">
                @if ($transaction->count() > 0 && $transaction->contains('payment_type', 'payment'))
                            @foreach ($transaction->where('payment_type', 'payment') as $key => $trans)
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
                                        <!---Add This Line----->
                                    @endif
                                    @php
                                        $dacTimeZone = new DateTimeZone('Asia/Dhaka');
                                        $created_at = optional($trans->created_at)->setTimezone($dacTimeZone);
                                        $formatted_date = optional($trans->created_at)->format('d F Y') ?? '';
                                        $formatted_time = $created_at ? $created_at->format('h:i A') : '';
                                    @endphp

                                    <td>{{ $formatted_date ?? '-' }} <Span style="color:brown">:</Span>
                                        {{ $formatted_time ?? '-' }}</td>
                                        <td>   {{$trans->debit}}</td>
                                        <td>   {{$trans->credit}}</td>
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
                                    <td class="actions">
                                        <a href="{{ route('transaction.invoice.receipt', $trans->id) }}"
                                            class="btn btn-sm btn-primary " title="Print">
                                            <i class="fa fa-print"></i><span style="padding-left: 5px">Receipt</span>
                                        </a>

                                    </td>
                                    <td class="text-warning">{{$trans->status}}</td>
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
