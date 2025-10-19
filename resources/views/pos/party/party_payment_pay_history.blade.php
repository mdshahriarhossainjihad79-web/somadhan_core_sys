<div class="col-md-12 grid-margin stretch-card">
    <div class="card">
        <div class="card-body">
            <h6 class="card-title text-info ">Party Statement Payment </h6>
            <div class="table-responsive">
                <table id="example" class="table">
                    <thead class="action">
                        <tr>
                            <th>SN</th>
                            <th>Party Name</th>
                            <th>Transaction Date & Time</th>
                            <th>Credit</th>
                            <th>Transaction Type</th>
                            <th>Note</th>

                        </tr>
                    </thead>
                    <tbody class="showData">
                        @if ($party_statements->count() > 0 && $party_statements->contains('reference_type', 'pay'))
                            @foreach ($party_statements->where('reference_type', 'pay') as $key => $party_statement)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $party_statement->customer->name }} | Type: {{$party_statement->customer->party_type}}</td>
                                    @php
                                        $dacTimeZone = new DateTimeZone('Asia/Dhaka');
                                        $created_at = optional($party_statement->created_at)->setTimezone($dacTimeZone);
                                        $formatted_date = optional($party_statement->created_at)->format('d F Y') ?? '';
                                        $formatted_time = $created_at ? $created_at->format('h:i A') : '';
                                    @endphp
                                    <td>{{ $formatted_date ?? '-' }} <Span style="color:brown">:</Span>
                                        {{ $formatted_time ?? '-' }}</td>
                                    <td>{{ $party_statement->credit }}</td>
                                    <td>{{ $party_statement->reference_type }}</td>
                                    <td class="note_short">
                                        @php
                                            $note = $party_statement->note ?? 'N/A';
                                            $noteChunks = str_split($note, 20);
                                            echo implode('<br>', $noteChunks);
                                        @endphp
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
