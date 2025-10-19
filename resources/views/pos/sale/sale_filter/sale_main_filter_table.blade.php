@if ($sales->count() > 0)
    @foreach ($sales as $index => $data)
        <tr>
            <td class="id">{{ $index + 1 }}</td>
            <td>
                <a href="{{ route('sale.invoice', $data->id) }}">
                    #{{ $data->invoice_number ?? 0 }}
                </a>
            </td>
            <td>
                <a href="{{ route('party.profile.ledger', $data->customer->id) }}">
                    {{ $data->customer->name ?? '' }}
                </a>
            </td>

            <td>{{ $data->quantity ?? 0 }}</td>
            <td>{{ $data->sale_date ?? 0 }}</td>
            <td>৳ {{ $data->product_total ?? 0 }}</td>
            <td>৳ {{ $data->actual_discount ?? 0 }}</td>

            <td>
                ৳ {{ $data->paid ?? 0 }}
            </td>

            <td>
                @if ($data->due > 0)
                    <span class="text-danger">৳ {{ $data->due ?? 0 }}</span>
                @else
                    ৳ {{ $data->due ?? 0 }}
                @endif
            </td>
            @if (Auth::user()->role !== 'salesman')
            <td> ৳
               {{$data->total_purchase_cost ?? 0}}

            </td>

            <td>
                ৳ {{$data->profit ?? 0}}
            </td>
            @endif

            <td>{{$data->saleBy->name ?? 'N/A'}}</td>
            <td>
                @if ($data->status ==='paid')
                    <span class="badge bg-success">Paid</span>
                @elseif($data->status ==='unpaid')
                    <span class="badge bg-warning">Unpaid</span>
                @elseif($data->status ==='partial')
                    <span class="badge bg-info">Partial</span>
                @endif
            </td>


            <td>
                @if ($data->order_status === 'completed')
                    <span class="badge bg-success">Completed</span>
                @elseif ($data->order_status === 'draft')
                    <span class="badge bg-warning">Draft</span>
                @elseif ($data->order_status === 'return')
                    <span class="badge bg-danger">Return</span>
                @elseif ($data->order_status === 'updated')
                    <span class="badge bg-info">Updated</span>
                @else
                    <span class="badge bg-secondary">Unknown</span>
                @endif
            </td>


        </tr>
    @endforeach
@else
    <tr>
        <td colspan="9"> No Data Found</td>
    </tr>
@endif
